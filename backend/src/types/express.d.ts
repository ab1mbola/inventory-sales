import { ScopedDB } from '../db/tenantFactory';

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
