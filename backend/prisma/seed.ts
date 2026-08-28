import { internal_unscoped_prisma as prisma } from '../src/db/client.js';
import * as bcrypt from 'bcryptjs';

async function main() {
  process.env.ALLOW_UNSAFE_GLOBAL_PRISMA = 'true';
  console.log('Seeding database...');
  
  // 1. Create default Company
  const company = await prisma.company.upsert({
    where: { id: 'default-company-id' }, // Use a fixed ID for consistent seeding
    update: {},
    create: {
      id: 'default-company-id',
      name: 'Default Company'
    }
  });

  // 2. Create default Admin
  const adminPassword = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@mnemos.com' },
    update: {},
    create: {
      email: 'admin@mnemos.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'OWNER',
      companyId: company.id
    }
  });

  // 3. Create a Category
  const electronics = await prisma.category.upsert({
    where: { companyId_name: { companyId: company.id, name: 'Electronics' } },
    update: {},
    create: {
      name: 'Electronics',
      description: 'Gadgets and electronic devices',
      companyId: company.id
    }
  });

  // 4. Create a Product
  await prisma.product.upsert({
    where: { companyId_sku: { companyId: company.id, sku: 'ELEC-PHONE-001' } },
    update: {},
    create: {
      sku: 'ELEC-PHONE-001',
      name: 'Smartphone Pro',
      description: 'Latest 5G smartphone',
      price: '699.99',
      cost: '450.00',
      stockLevel: 50,
      minStock: 10,
      categoryId: electronics.id,
      companyId: company.id
    }
  });

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  });
