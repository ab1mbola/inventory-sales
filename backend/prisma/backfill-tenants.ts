/// <reference types="node" />
import 'dotenv/config'; // Ensure env vars are loaded before anything else
import { internal_unscoped_prisma as prisma } from '../src/db/client';

const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  console.log('--- Multi-Tenant Backfill Script ---');
  if (DRY_RUN) console.log('[DRY RUN] No changes will be persisted to the database.\n');

  // 1. Validate CompanySettings
  const settings = await prisma.companySettings.findFirst();
  if (!settings) {
    console.error('❌ ABORTING: No CompanySettings found. Cannot create a company without source settings.');
    process.exit(1);
    return; // Help TS narrowing
  }

  // 2. Check for existing companies to prevent duplicates
  const existingCompanyCount = await prisma.company.count();
  if (existingCompanyCount > 0) {
    console.error(`❌ ABORTING: ${existingCompanyCount} company(s) already exist. Backfill may have already run.`);
    process.exit(1);
    return; // Help TS narrowing
  }

  const companyName = settings.name;
  const companyLogo = settings.logo;
  const companyCopyright = settings.copyrightText;

  // 3. Summary of records to backfill
  const counts = {
    users: await prisma.user.count({ where: { companyId: null } }),
    categories: await prisma.category.count({ where: { companyId: null } }),
    products: await prisma.product.count({ where: { companyId: null } }),
    customers: await prisma.customer.count({ where: { companyId: null } }),
    payments: await prisma.customerPayment.count({ where: { companyId: null } }),
    sales: await prisma.sale.count({ where: { companyId: null } }),
    expenses: await prisma.expense.count({ where: { companyId: null } }),
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
        tx.user.updateMany({ where: { companyId: null }, data: { companyId } }),
        tx.category.updateMany({ where: { companyId: null }, data: { companyId } }),
        tx.product.updateMany({ where: { companyId: null }, data: { companyId } }),
        tx.customer.updateMany({ where: { companyId: null }, data: { companyId } }),
        tx.customerPayment.updateMany({ where: { companyId: null }, data: { companyId } }),
        tx.sale.updateMany({ where: { companyId: null }, data: { companyId } }),
        tx.expense.updateMany({ where: { companyId: null }, data: { companyId } }),
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
