import { ScopedDB } from '../db/tenantFactory';

export class ProductService {
  constructor(private db: ScopedDB) {}

  async getAllProducts(filters: { search?: string; categoryId?: string; lowStock?: string }) {
    const { search, categoryId, lowStock } = filters;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (lowStock === 'true') {
      // Raw query must be explicitly scoped using the helper and context
      return this.db.$scopedQueryRaw`
        SELECT p.*, c.name as "categoryName"
        FROM "Product" p
        LEFT JOIN "Category" c ON p."categoryId" = c.id
        WHERE p."stockLevel" <= p."minStock"
        AND p."companyId" = ${this.db.$tenantId}
        ORDER BY p."stockLevel" ASC
      `;
    }

    return this.db.product.findMany({
      where,
      include: { category: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getProductById(id: string) {
    return this.db.product.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  async createProduct(data: any) {
    return this.db.product.create({
      data,
      include: { category: true },
    });
  }

  async updateProduct(id: string, data: any) {
    return this.db.product.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async deleteProduct(id: string) {
    return this.db.product.delete({
      where: { id },
    });
  }
}
