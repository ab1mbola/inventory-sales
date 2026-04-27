import dotenv from 'dotenv';
dotenv.config();
import { prisma } from './utils/prisma';
import bcrypt from 'bcryptjs';

async function bootstrap() {
  const email = 'admin@inventory.com';
  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: { password: hashedPassword },
      create: {
        email,
        password: hashedPassword,
        name: 'Admin User',
        role: 'OWNER'
      }
    });
    console.log('Admin user bootstrapped:', user.email);
  } catch (error) {
    console.error('Bootstrap failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

bootstrap();
