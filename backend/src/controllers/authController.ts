import { Request, Response } from 'express';
import { internal_unscoped_prisma as prisma } from '../db/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, companyName } = req.body;
    console.log(`Registration attempt for: ${email}`);

    if (!email || !password || !name || !companyName) {
      return res.status(400).json({ error: 'Missing required fields (email, password, name, companyName)' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log(`User already exists: ${email}`);
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed. Starting transaction...');

    // Atomic transaction to create company and owner
    const result = await prisma.$transaction(async (tx) => {
      console.log('Creating company...');
      const company = await tx.company.create({
        data: { name: companyName }
      });

      console.log(`Company created: ${company.id}. Creating user...`);
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'OWNER',
          companyId: company.id
        }
      });

      return { user, company };
    });

    console.log(`Registration successful for: ${email}`);
    const token = jwt.sign(
      { userId: result.user.id, companyId: result.company.id, role: result.user.role }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        companyId: result.company.id
      },
    });
  } catch (error) {
    console.error('Registration Error Details:', error);
    res.status(500).json({ error: 'Failed to register user and company' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, companyId: user.companyId, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId
      },
    });
  } catch (error: any) {
    console.error('CRITICAL LOGIN ERROR:', error);
    res.status(500).json({ error: 'Failed to login', details: error.message });
  }
};

export const me = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await req.db.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, role: true, companyId: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};
