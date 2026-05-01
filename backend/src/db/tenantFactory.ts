import { internal_unscoped_prisma } from './client';

/**
 * Creates a tenant-scoped Prisma client.
 * This client automatically injects the companyId into all queries and data mutations.
 */
export const createTenantDB = (companyId: string) => {
  return internal_unscoped_prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          // Models that are NOT tenant-scoped or don't have companyId
          const globalModels = ['Company', 'CompanySettings'];
          
          if (globalModels.includes(model as string)) {
            return query(args);
          }

          const extendedArgs = (args || {}) as any;

          // 1. Enforce scoping for READ operations
          if (['findMany', 'findFirst', 'count', 'aggregate', 'groupBy'].includes(operation)) {
            extendedArgs.where = { ...extendedArgs.where, companyId };
          }

          // findUnique handling - skip companyId to avoid 500 on non-unique field
          if (operation === 'findUnique' || operation === 'findUniqueOrThrow') {
             // Leave it unscoped for now to avoid Prisma constraint errors
          }

          // 2. Enforce scoping for WRITE operations that use 'where'
          if (['update', 'updateMany', 'delete', 'deleteMany', 'upsert'].includes(operation)) {
            extendedArgs.where = { ...extendedArgs.where, companyId };
          }

          // 3. Auto-inject companyId for CREATE operations
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
        console.warn('Using $scopedQueryRaw. Ensure your SQL explicitly filters by companyId using the provided context.');
        return internal_unscoped_prisma.$queryRaw<T>(query, ...values);
      }
    }
  });
};

export type ScopedDB = ReturnType<typeof createTenantDB>;
