/**
 * Utility functions to help with tenant-scoped queries.
 * Ensures companyId is always injected into where clauses and data objects.
 */

export const scope = (companyId: string | undefined, where: any = {}) => {
  if (!companyId) {
    throw new Error('Tenant scoping failed: companyId is missing.');
  }
  return {
    ...where,
    companyId,
  };
};

export const tenantData = (companyId: string | undefined, data: any = {}) => {
  if (!companyId) {
    throw new Error('Tenant data injection failed: companyId is missing.');
  }
  return {
    ...data,
    companyId,
  };
};
