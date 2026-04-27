import { prisma } from './utils/prisma';

async function main() {
  try {
    const categories = await prisma.category.findMany();
    console.log('Connected! Categories count:', categories.length);
  } catch (e) {
    console.error('Failed to connect:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
