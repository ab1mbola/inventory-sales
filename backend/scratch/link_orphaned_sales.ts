import dotenv from 'dotenv';
dotenv.config();
import { prisma } from '../src/utils/prisma';

async function main() {
  const orphanedSales = await prisma.sale.findMany({
    where: {
      paymentMethod: 'CREDIT',
      customerId: null
    }
  });

  console.log(`Found ${orphanedSales.length} orphaned credit sales.`);
  
  for (const sale of orphanedSales) {
    console.log(`Sale ID: ${sale.id}, Customer: ${sale.customerName}, Phone: ${sale.customerPhone}, Total: ${sale.totalAmount}`);
    
    if (sale.customerName) {
        // Try to find a customer by phone first
        let customer = null;
        if (sale.customerPhone) {
            customer = await prisma.customer.findUnique({
                where: { phone: sale.customerPhone }
            });
        }

        // If not found, try by name
        if (!customer) {
            customer = await prisma.customer.findFirst({
                where: { name: sale.customerName }
            });
        }

        // If still not found, create one
        if (!customer) {
            console.log(`Creating new customer: ${sale.customerName}`);
            customer = await prisma.customer.create({
                data: {
                    name: sale.customerName,
                    phone: sale.customerPhone,
                }
            });
        }

        // Link the sale
        await prisma.sale.update({
            where: { id: sale.id },
            data: { customerId: customer.id }
        });
        console.log(`Linked sale ${sale.id} to customer ${customer.name}`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
