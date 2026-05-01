/// <reference types="node" />
import 'dotenv/config'; // Ensure env vars are loaded before anything else
import { internal_unscoped_prisma as prisma } from '../src/db/client';

const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  console.log('--- Multi-Tenant Backfill Script ---');
  if (DRY_RUN) console.log('[DRY RUN] No changes will be persisted to the database.\n');

  // 1. Get company source info
  // If CompanySettings is gone, we use default values
  let companyName = "Default Company";
  let companyLogo = null;
  let companyCopyright = null;

  try {
    // We use a raw query check if CompanySettings table still exists during migration
    const settings: any = await prisma.$queryRaw`SELECT * FROM "CompanySettings" LIMIT 1`.catch(() => null);
    if (settings && settings.length > 0) {
      companyName = settings[0].name;
      companyLogo = settings[0].logo;
      companyCopyright = settings[0].copyrightText;
    }
  } catch (e) {
    console.log('Note: CompanySettings table not found or inaccessible, using defaults.');
  }

  // 2. Check for existing companies to prevent duplicates
  const existingCompanyCount = await prisma.company.count();
  if (existingCompanyCount > 0) {
    console.log(`ℹ️ INFO: ${existingCompanyCount} company(s) already exist. Skipping creation.`);
  }

  // 3. Summary of records to backfill
  // We cast to any to bypass the non-nullable type check for companyId
  const counts = {
    users: await prisma.user.count({ where: { companyId: null } as any }),
    categories: await prisma.category.count({ where: { companyId: null } as any }),
    products: await prisma.product.count({ where: { companyId: null } as any }),
    customers: await prisma.customer.count({ where: { companyId: null } as any }),
    payments: await prisma.customerPayment.count({ where: { companyId: null } as any }),
    sales: await prisma.sale.count({ where: { companyId: null } as any }),
    expenses: await prisma.expense.count({ where: { companyId: null } as any }),
  };

  console.log('Records to backfill (unassigned):');
  console.table(counts);

  if (Object.values(counts).every(c => c === 0)) {
    console.log('✅ No unassigned records found. Migration may already be complete.');
    return;
  }

  if (DRY_RUN) {
    console.log('\n[DRY RUN] Backfill summary complete. Exiting.');
    return;
  }

  // 4. Execute Backfill in Transaction
  console.log('\nStarting backfill...');
  
  try {
    await prisma.$transaction(async (tx) => {
      // Create the default company
      const defaultCompany = await tx.company.create({
        data: {
          name: companyName,
          logo: companyLogo,
          copyrightText: companyCopyright,
        },
      });

      const companyId = defaultCompany.id;
      console.log(`✅ Created default company: ${companyName} (${companyId})`);

      // Link all unassigned records
      const results = await Promise.all([
        tx.user.updateMany({ where: { companyId: null } as any, data: { companyId } }),
        tx.category.updateMany({ where: { companyId: null } as any, data: { companyId } }),
        tx.product.updateMany({ where: { companyId: null } as any, data: { companyId } }),
        tx.customer.updateMany({ where: { companyId: null } as any, data: { companyId } }),
        tx.customerPayment.updateMany({ where: { companyId: null } as any, data: { companyId } }),
        tx.sale.updateMany({ where: { companyId: null } as any, data: { companyId } }),
        tx.expense.updateMany({ where: { companyId: null } as any, data: { companyId } }),
      ]);

      console.log('Update results:');
      console.log(`- Users: ${results[0].count}`);
      console.log(`- Categories: ${results[1].count}`);
      console.log(`- Products: ${results[2].count}`);
      console.log(`- Customers: ${results[3].count}`);
      console.log(`- Customer Payments: ${results[4].count}`);
      console.log(`- Sales: ${results[5].count}`);
      console.log(`- Expenses: ${results[6].count}`);
    });

    console.log('\n✨ Backfill completed successfully!');
  } catch (error) {
    console.error('\n❌ Backfill failed. All changes rolled back.');
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
