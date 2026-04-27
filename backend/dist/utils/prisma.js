"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
// Bypasses SSL certificate validation errors (common in Supabase IPv4 environments)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const connectionString = process.env.DATABASE_URL;
const pool = new pg_1.Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    },
    max: 10, // Limit connections to prevent pool exhaustion on Supabase
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Increase connection timeout
});
const adapter = new adapter_pg_1.PrismaPg(pool);
exports.prisma = new client_1.PrismaClient({ adapter });
