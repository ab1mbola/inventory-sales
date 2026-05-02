/// <reference types="node" />
import 'dotenv/config';
import { internal_unscoped_prisma as prisma } from '../src/db/client';

// 1. EXECUTION MODES
const IS_EXECUTE = process.argv.includes('--execute');
const FORCE_MULTI = process.argv.includes('--force-multi-company-migration');

// 4. REMOVE TYPECAST SILENT FAILURES
// Migration-only workaround for querying fields that are marked NOT NULL in the Prisma schema
// but are currently nullable in the underlying database during this specific migration phase.
const ORPHAN_WHERE = { companyId: null } as unknown as any;

// Define Registry Type
type RegistryEntry = {
  model: string;
  countFn: (client: any) => Promise<number>;
  updateFn: (tx: any, companyId: string) => Promise<number>;
  groupByFn: (client: any) => Promise<any[]>;
};

// 3. CENTRALIZED MIGRATION REGISTRY
// Order matters: 'Sale' must be updated before 'SaleItem'
const registry: RegistryEntry[] = [
  {
    model: 'User',
    countFn: async (client) => Number((await client.$queryRaw`SELECT COUNT(*)::int as count FROM "User" WHERE "companyId" IS NULL` as any)[0].count),
    updateFn: async (tx, companyId) => Number(await tx.$executeRaw`UPDATE "User" SET "companyId" = ${companyId} WHERE "companyId" IS NULL`),
    groupByFn: (client) => client.user.groupBy({ by: ['companyId'], _count: { id: true } }),
  },
  {
    model: 'Category',
    countFn: async (client) => Number((await client.$queryRaw`SELECT COUNT(*)::int as count FROM "Category" WHERE "companyId" IS NULL` as any)[0].count),
    updateFn: async (tx, companyId) => Number(await tx.$executeRaw`UPDATE "Category" SET "companyId" = ${companyId} WHERE "companyId" IS NULL`),
    groupByFn: (client) => client.category.groupBy({ by: ['companyId'], _count: { id: true } }),
  },
  {
    model: 'Product',
    countFn: async (client) => Number((await client.$queryRaw`SELECT COUNT(*)::int as count FROM "Product" WHERE "companyId" IS NULL` as any)[0].count),
    updateFn: async (tx, companyId) => Number(await tx.$executeRaw`UPDATE "Product" SET "companyId" = ${companyId} WHERE "companyId" IS NULL`),
    groupByFn: (client) => client.product.groupBy({ by: ['companyId'], _count: { id: true } }),
  },
  {
    model: 'Customer',
    countFn: async (client) => Number((await client.$queryRaw`SELECT COUNT(*)::int as count FROM "Customer" WHERE "companyId" IS NULL` as any)[0].count),
    updateFn: async (tx, companyId) => Number(await tx.$executeRaw`UPDATE "Customer" SET "companyId" = ${companyId} WHERE "companyId" IS NULL`),
    groupByFn: (client) => client.customer.groupBy({ by: ['companyId'], _count: { id: true } }),
  },
  {
    model: 'CustomerPayment',
    countFn: async (client) => Number((await client.$queryRaw`SELECT COUNT(*)::int as count FROM "CustomerPayment" WHERE "companyId" IS NULL` as any)[0].count),
    updateFn: async (tx, companyId) => Number(await tx.$executeRaw`UPDATE "CustomerPayment" SET "companyId" = ${companyId} WHERE "companyId" IS NULL`),
    groupByFn: (client) => client.customerPayment.groupBy({ by: ['companyId'], _count: { id: true } }),
  },
  {
    model: 'Sale',
    countFn: async (client) => Number((await client.$queryRaw`SELECT COUNT(*)::int as count FROM "Sale" WHERE "companyId" IS NULL` as any)[0].count),
    updateFn: async (tx, companyId) => Number(await tx.$executeRaw`UPDATE "Sale" SET "companyId" = ${companyId} WHERE "companyId" IS NULL`),
    groupByFn: (client) => client.sale.groupBy({ by: ['companyId'], _count: { id: true } }),
  },
  {
    model: 'Expense',
    countFn: async (client) => Number((await client.$queryRaw`SELECT COUNT(*)::int as count FROM "Expense" WHERE "companyId" IS NULL` as any)[0].count),
    updateFn: async (tx, companyId) => Number(await tx.$executeRaw`UPDATE "Expense" SET "companyId" = ${companyId} WHERE "companyId" IS NULL`),
    groupByFn: (client) => client.expense.groupBy({ by: ['companyId'], _count: { id: true } }),
  },
  // 3. HARDEN SALEITEM SAFETY
  {
    model: 'SaleItem',
    countFn: async (client) => Number((await client.$queryRaw`SELECT COUNT(*)::int as count FROM "SaleItem" WHERE "companyId" IS NULL` as any)[0].count),
    updateFn: async (tx, _companyId) => {
      // Intentionally ignoring the passed companyId to enforce deriving strictly from parent Sale.
      // Explicitly checking "Sale"."companyId" IS NOT NULL to prevent fallback assumptions.
      const res = await tx.$executeRaw`
        UPDATE "SaleItem"
        SET "companyId" = "Sale"."companyId"
        FROM "Sale"
        WHERE "SaleItem"."saleId" = "Sale"."id"
        AND "SaleItem"."companyId" IS NULL
        AND "Sale"."companyId" IS NOT NULL
      `;
      return Number(res);
    },
    groupByFn: (client) => client.saleItem.groupBy({ by: ['companyId'], _count: { id: true } }),
  }
];

async function main() {
  const startTime = Date.now();
  console.log('--- STRICT MULTI-TENANT MIGRATION RUNNER ---');
  
  if (IS_EXECUTE) {
    console.log('\n======================================');
    console.log('          EXECUTE MODE ⚠️          ');
    console.log('   Data mutation is ENABLED.          ');
    console.log('======================================\n');
  } else {
    console.log('\n======================================');
    console.log('          DRY RUN MODE              ');
    console.log(' No writes will occur. Pass --execute to run.');
    console.log('======================================\n');
  }

  // 1. REMOVE ENVIRONMENT ASSUMPTION (Precondition Check)
  console.log('Running Precondition Checks...');
  const companyCount = await prisma.company.count();
  console.log(`- Companies found in DB: ${companyCount}`);

  if (companyCount > 1 && !FORCE_MULTI) {
    console.error('\n❌ FATAL: Precondition failed.');
    console.error(`Found ${companyCount} companies.`);
    console.error('This runner is intended for single-tenant to multi-tenant migration.');
    console.error('Because multiple companies exist, guessing ownership of orphan records is dangerous.');
    console.error('\nTo proceed, you must pass the --force-multi-company-migration flag.');
    console.error('If forced, all orphan records will be assigned to a new, isolated "Orphaned Records Archive" company to prevent cross-tenant corruption.');
    process.exit(1);
  }

  const report = {
    duration: 0,
    tablesUpdated: {} as Record<string, number>,
    orphanCountsBefore: {} as Record<string, number>,
    orphanCountsAfter: {} as Record<string, number>,
    companyIdUsed: null as string | null,
    status: 'PENDING',
    multiCompanySpread: {} as Record<string, any[]>
  };

  console.log('\nScanning for orphan records (companyId IS NULL)...');
  let totalOrphans = 0;

  for (const entry of registry) {
    const count = await entry.countFn(prisma);
    report.orphanCountsBefore[entry.model] = count;
    totalOrphans += count;
  }

  console.table(report.orphanCountsBefore);

  if (totalOrphans === 0) {
    console.log('\n✅ No orphan records found. Database is fully migrated.');
    report.status = 'SUCCESS_NO_OP';
    report.duration = Date.now() - startTime;
    console.log('\n--- FINAL MIGRATION REPORT ---');
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  try {
    if (!IS_EXECUTE) {
      console.log('\n[DRY RUN] Scan complete. Exiting without changes.');
      report.status = 'DRY_RUN_COMPLETE';
      return;
    }

    console.log('\n🚀 Starting Transactional Migration...');

    await prisma.$transaction(async (tx) => {
      let activeCompanyId: string;

      if (companyCount === 0) {
        console.log('  - No company found. Creating "Default Company"...');
        const defaultCompany = await tx.company.create({
          data: { name: 'Default Company' },
        });
        activeCompanyId = defaultCompany.id;
        console.log(`  - ✅ Created Default Company: ${activeCompanyId}`);
      } else if (companyCount === 1) {
        const existingCompany = await tx.company.findFirstOrThrow();
        activeCompanyId = existingCompany.id;
        console.log(`  - Using existing Company ID: ${activeCompanyId}`);
      } else {
        console.log('  - ⚠️ FORCE FLAG DETECTED with >1 companies.');
        console.log('  - Creating isolated "Orphaned Records Archive" to prevent data leakage...');
        const archiveCompany = await tx.company.create({
          data: { name: 'Orphaned Records Archive' },
        });
        activeCompanyId = archiveCompany.id;
        console.log(`  - ✅ Created Archive Company: ${activeCompanyId}`);
      }

      report.companyIdUsed = activeCompanyId;

      console.log('\nExecuting Table Updates:');
      
      for (const entry of registry) {
        if (report.orphanCountsBefore[entry.model] > 0) {
          const updateCount = await entry.updateFn(tx, activeCompanyId);
          report.tablesUpdated[entry.model] = updateCount;
          console.log(`  - [${entry.model}] Updated ${updateCount} records.`);
          
          if (updateCount !== report.orphanCountsBefore[entry.model] && entry.model !== 'SaleItem') {
             console.warn(`    ⚠️ Warning: Expected to update ${report.orphanCountsBefore[entry.model]}, but updated ${updateCount}.`);
          }
        } else {
          report.tablesUpdated[entry.model] = 0;
          console.log(`  - [${entry.model}] No updates needed.`);
        }
      }

      console.log('\nRunning Post-Migration Validation...');
      let validationFailed = false;

      for (const entry of registry) {
        const remaining = await entry.countFn(tx);
        report.orphanCountsAfter[entry.model] = remaining;
        
        if (remaining > 0) {
          console.error(`  - ❌ [${entry.model}] FAILED: ${remaining} orphan records remain!`);
          validationFailed = true;
        } else {
          console.log(`  - ✅ [${entry.model}] Clean (0 orphans).`);
        }
      }

      if (validationFailed) {
        throw new Error('Validation Phase Failed. Orphan records remain. Forcing transaction rollback.');
      }

      console.log('\n✅ All primary validations passed.');
    });

    // 2. ADD POST-MIGRATION INTEGRITY CHECK (Outside Transaction to reflect committed state)
    console.log('\nPerforming Multi-Company Spread Analysis...');
    for (const entry of registry) {
      const spread = await entry.groupByFn(prisma);
      report.multiCompanySpread[entry.model] = spread;
    }

    report.status = 'SUCCESS';
    report.duration = Date.now() - startTime;
    
    console.log('\n✨ MIGRATION COMPLETED SUCCESSFULLY ✨');
    
  } catch (error) {
    report.status = 'FAILED';
    report.duration = Date.now() - startTime;
    console.error('\n🚨 MIGRATION ABORTED. FULL TRANSACTION ROLLBACK EXECUTED. 🚨');
    console.error(error);
  } finally {
    // 5. ADD FINAL "MIGRATION REPORT OBJECT"
    console.log('\n--- FINAL MIGRATION REPORT ---');
    console.log(JSON.stringify(report, null, 2));
    
    if (report.status === 'FAILED') {
      process.exit(1);
    }
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
