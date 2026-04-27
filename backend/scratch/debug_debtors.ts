import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const customers = await prisma.customer.findMany({
    include: {
      sales: {
        where: { paymentMethod: 'CREDIT' }
      },
      payments: true
    }
  });

  console.log(`Found ${customers.length} total customers.`);
  for (const c of customers) {
    const totalCreditSales = c.sales.reduce((sum: number, sale: any) => sum + Number(sale.totalAmount), 0);
    const totalAmountPaidOnCreditSales = c.sales.reduce((sum: number, sale: any) => sum + Number(sale.amountReceived || 0), 0);
    const totalRepayments = c.payments.reduce((sum: number, payment: any) => sum + Number(payment.amount), 0);
    const totalOwed = totalCreditSales - totalAmountPaidOnCreditSales - totalRepayments;
    
    console.log(`Customer: ${c.name}, Owed: ${totalOwed}, SalesCount: ${c.sales.length}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
