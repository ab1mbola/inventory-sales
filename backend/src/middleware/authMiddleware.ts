import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { internal_unscoped_prisma as prisma } from '../db/client.js';
import { createTenantDB, ScopedDB } from '../db/tenantFactory.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';

// Extend Express Request type via global augmentation in src/types/express.d.ts
// We can still export a helper type if we want, but it should be optional
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        companyId: string;
        role: string;
      };
      db: ScopedDB;
    }
  }
}

// Export a helper type that we use in controllers
export type AuthenticatedRequest = Request;

export const authenticate = async (req: any, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    
    // 1. Basic validation from JWT
    if (!decoded.userId || !decoded.companyId) {
      return res.status(401).json({ error: 'Invalid token payload: missing context.' });
    }

    // 2. Database validation: Ensure user exists and belongs to the company
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, companyId: true, role: true }
    });

    if (!user || user.companyId !== decoded.companyId) {
      return res.status(403).json({ error: 'Unauthorized: User/Company mismatch or account deleted.' });
    }

    // 3. Attach immutable context and the Scoped DB instance
    req.user = {
      id: user.id,
      companyId: user.companyId as string,
      role: user.role
    };
    
    // THE CORE SECURITY LAYER: From this point on, controllers use req.db
    req.db = createTenantDB(user.companyId as string);

    next();
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(401).json({ error: 'Invalid token.' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permission denied. Insufficient privileges.' });
    }
    next();
  };
};
