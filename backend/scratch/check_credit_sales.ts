import dotenv from 'dotenv';
dotenv.config();
import { prisma } from '../src/utils/prisma';

async function main() {
  const creditSales = await prisma.sale.findMany({
    where: {
      paymentMethod: 'CREDIT'
    },
    include: {
        customer: true
    }
  });

  console.log(`Found ${creditSales.length} total credit sales.`);
  for (const sale of creditSales) {
    console.log(`ID: ${sale.id}, Customer: ${sale.customer?.name || sale.customerName}, Phone: ${sale.customerPhone}, Owed: ${Number(sale.totalAmount) - Number(sale.amountReceived || 0)}, CustomerId: ${sale.customerId}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
