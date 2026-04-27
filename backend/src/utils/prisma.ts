import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Bypasses SSL certificate validation errors (common in Supabase IPv4 environments)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ 
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10, // Limit connections to prevent pool exhaustion on Supabase
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increase connection timeout
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
