import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  getDatabaseConnectionString,
  getDatabaseEnvironment,
} from '../config/databaseEnvironment';

// Bypasses SSL certificate validation errors
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const databaseEnvironment = getDatabaseEnvironment();
const connectionString = getDatabaseConnectionString();

if (!connectionString) {
  const expectedVariable = databaseEnvironment === 'prod' ? 'DATABASE_URL_PROD' : 'DATABASE_URL_DEV';
  console.error(`CRITICAL ERROR: No ${databaseEnvironment} database connection string found.`);
  console.error(`Expected ${expectedVariable} for this deployment environment.`);
  // We don't process.exit(1) here to allow the server to start (for health checks)
  // but subsequent DB calls will fail with a clear error.
}

const pool = new Pool({ 
  connectionString: connectionString || '',
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
});

const adapter = new PrismaPg(pool);

/**
 * @internal 
 * This is the base Prisma client. 
 * DO NOT IMPORT OR USE THIS DIRECTLY IN CONTROLLERS OR SERVICES.
 * Use the tenant-scoped factory instead.
 */
const basePrisma = new PrismaClient({ 
  adapter,
  log: ['info', 'warn', 'error'],
});

// Proxy to track/block unsafe access in development
export const internal_unscoped_prisma = new Proxy(basePrisma, {
  get(target, prop, receiver) {
    const sProp = String(prop);

    // 1. Allow all internal Prisma properties, symbols, and standard JS properties
    if (
      typeof prop === 'symbol' || 
      sProp.startsWith('$') || 
      sProp.startsWith('_') || 
      sProp === 'then' || 
      sProp === 'constructor'
    ) {
      return Reflect.get(target, prop, receiver);
    }

    // Allow infrastructure models for authentication and system configuration
    const infrastructureModels = ['user', 'company'];
    if (infrastructureModels.includes(sProp)) {
      return Reflect.get(target, prop, receiver);
    }

    // Block direct model access if not explicitly allowed (e.g., in seeds or scripts)
    if (process.env.NODE_ENV !== 'production' && !process.env.ALLOW_UNSAFE_GLOBAL_PRISMA) {
      console.error(`❌ SECURITY ALERT: Unsafe direct access to global Prisma model: "${String(prop)}"`);
      console.error('Use req.db instead to ensure tenant isolation.');
      throw new Error(`Direct access to global Prisma model "${String(prop)}" is forbidden.`);
    }

    return Reflect.get(target, prop, receiver);
  }
});
