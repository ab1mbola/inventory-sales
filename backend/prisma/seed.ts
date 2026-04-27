import { prisma } from '../src/utils/prisma';
import * as bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding database...');
  
  // Create default Admin
  const adminPassword = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@inventory.com' },
    update: {},
    create: {
      email: 'admin@inventory.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'OWNER'
    }
  });

  // Create a Category
  const electronics = await prisma.category.upsert({
    where: { name: 'Electronics' },
    update: {},
    create: {
      name: 'Electronics',
      description: 'Gadgets and electronic devices'
    }
  });

  // Create a Product
  const phone = await prisma.product.upsert({
    where: { sku: 'ELEC-PHONE-001' },
    update: {},
    create: {
      sku: 'ELEC-PHONE-001',
      name: 'Smartphone Pro',
      description: 'Latest 5G smartphone',
      price: 699.99,
      cost: 450.00,
      stockLevel: 50,
      minStock: 10,
      categoryId: electronics.id
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
