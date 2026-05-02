import { internal_unscoped_prisma } from './client';

/**
 * Creates a tenant-scoped Prisma client.
 * This client automatically injects the companyId into all queries and data mutations.
 */
export const createTenantDB = (companyId: string) => {
  const extendedClient = internal_unscoped_prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          // Models that are NOT tenant-scoped (System level)
          const globalModels = ['Company'];
          
          if (globalModels.includes(model as string)) {
            return query(args);
          }

          const extendedArgs = (args || {}) as any;

          // 1. Enforce scoping for READ operations
          if (['findMany', 'findFirst', 'count', 'aggregate', 'groupBy'].includes(operation)) {
            extendedArgs.where = { ...extendedArgs.where, companyId };
          }

          // 2. Fix findUnique Isolation Breach
          // Convert findUnique to findFirst with companyId to ensure cross-tenant probing returns null
          if (operation === 'findUnique' || operation === 'findUniqueOrThrow') {
            const newOperation = operation === 'findUnique' ? 'findFirst' : 'findFirstOrThrow';
            extendedArgs.where = { ...extendedArgs.where, companyId };
            return (internal_unscoped_prisma[model as any] as any)[newOperation](extendedArgs);
          }

          // 3. Enforce scoping for WRITE operations that use 'where'
          if (['update', 'updateMany', 'delete', 'deleteMany', 'upsert'].includes(operation)) {
            extendedArgs.where = { ...extendedArgs.where, companyId };
          }

          // 4. Auto-inject companyId for CREATE operations
          if (operation === 'create') {
            extendedArgs.data = { ...extendedArgs.data, companyId };
          }
          
          if (operation === 'createMany') {
            if (Array.isArray(extendedArgs.data)) {
              extendedArgs.data = extendedArgs.data.map((item: any) => ({ ...item, companyId }));
            } else if (extendedArgs.data) {
              extendedArgs.data = { ...extendedArgs.data, companyId };
            }
          }

          if (operation === 'upsert') {
            extendedArgs.create = { ...extendedArgs.create, companyId };
            extendedArgs.update = { ...extendedArgs.update, companyId };
          }

          return query(extendedArgs);
        },
      },
    },
    client: {
      $scopedQueryRaw<T = any>(query: TemplateStringsArray, ...values: any[]) {
        console.warn('Using $scopedQueryRaw. Ensure your SQL explicitly filters by companyId using req.db.$tenantId.');
        return internal_unscoped_prisma.$queryRaw<T>(query, ...values);
      }
    }
  });

  // Attach companyId property for service-layer access (e.g. raw queries)
  return Object.assign(extendedClient, { $tenantId: companyId });
};

export type ScopedDB = ReturnType<typeof createTenantDB>;
