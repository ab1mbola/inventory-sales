/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

// Bypasses SSL certificate validation errors
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function main() {
  const prodUrl = process.env.DATABASE_URL_PROD;
  const devUrl = process.env.DATABASE_URL_DEV;

  if (!prodUrl || !devUrl) {
    console.error('Missing DATABASE_URL_PROD or DATABASE_URL_DEV in .env');
    process.exit(1);
  }

  console.log('--- Database Synchronization Utility ---');
  console.log('Source (PROD):', prodUrl.split('@')[1]); // Log host only for security
  console.log('Target (DEV):', devUrl.split('@')[1]);
  console.log('----------------------------------------');

  // Initialize Source (PROD)
  const prodPool = new Pool({ connectionString: prodUrl });
  const prodAdapter = new PrismaPg(prodPool);
  const prodPrisma = new PrismaClient({ adapter: prodAdapter });

  // Initialize Target (DEV)
  const devPool = new Pool({ connectionString: devUrl });
  const devAdapter = new PrismaPg(devPool);
  const devPrisma = new PrismaClient({ adapter: devAdapter });

  try {
    console.log('Cleaning target (DEV) database...');
    // Order matters for foreign keys
    await devPrisma.saleItem.deleteMany();
    await devPrisma.sale.deleteMany();
    await devPrisma.customerPayment.deleteMany();
    await devPrisma.customer.deleteMany();
    await devPrisma.product.deleteMany();
    await devPrisma.category.deleteMany();
    await devPrisma.user.deleteMany();
    await devPrisma.company.deleteMany();
    console.log('Target database cleaned.');

    console.log('Fetching data from source (PROD)...');
    const users = await prodPrisma.user.findMany();
    const categories = await prodPrisma.category.findMany();
    const products = await prodPrisma.product.findMany();
    const customers = await prodPrisma.customer.findMany();
    const sales = await prodPrisma.sale.findMany();
    const saleItems = await prodPrisma.saleItem.findMany();

    console.log(`Fetched ${users.length} users, ${products.length} products, ${sales.length} sales.`);

    console.log('Pushing data to target (DEV)...');
    
    // Create records in dev
    if (users.length > 0) await devPrisma.user.createMany({ data: users });
    if (categories.length > 0) await devPrisma.category.createMany({ data: categories });
    if (products.length > 0) await devPrisma.product.createMany({ data: products });
    if (customers.length > 0) await devPrisma.customer.createMany({ data: customers });
    if (sales.length > 0) await devPrisma.sale.createMany({ data: sales });
    if (saleItems.length > 0) await devPrisma.saleItem.createMany({ data: saleItems });

    console.log('--- Sync Completed Successfully ---');
  } catch (error) {
    console.error('--- Sync Failed ---');
    console.error(error);
  } finally {
    await prodPrisma.$disconnect();
    await devPrisma.$disconnect();
    await prodPool.end();
    await devPool.end();
  }
}

main();
