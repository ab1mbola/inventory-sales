import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Bypasses SSL certificate validation errors (common in Supabase IPv4 environments)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const connectionString = process.env.DB_ENV === 'prod' 
  ? process.env.DATABASE_URL_PROD 
  : process.env.DATABASE_URL_DEV;

if (!connectionString) {
  console.error(`Error: DATABASE_URL_${process.env.DB_ENV?.toUpperCase() || 'DEV'} is missing in .env`);
  process.exit(1);
}

const pool = new Pool({ 
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

pool.connect()
  .then(() => console.log('Successfully connected to the database pool'))
  .catch(err => console.error('Error connecting to the database pool', err));

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ 
  adapter,
  log: ['query', 'info', 'warn', 'error'],
});
