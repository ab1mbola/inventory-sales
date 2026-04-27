import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { search, categoryId, lowStock } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { sku: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId as string;
    }

    if (lowStock === 'true') {
      where.stockLevel = { lte: prisma.product.fields?.minStock ?? 10 };
      // Use raw filter for column comparison
      const products = await prisma.$queryRaw`
        SELECT p.*, c.name as "categoryName"
        FROM "Product" p
        LEFT JOIN "Category" c ON p."categoryId" = c.id
        WHERE p."stockLevel" <= p."minStock"
        ORDER BY p."stockLevel" ASC
      `;
      return res.json(products);
    }

    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { sku, name, description, price, cost, stockLevel, minStock, categoryId } = req.body;

    if (!sku || !name || price == null || cost == null) {
      return res.status(400).json({ error: 'sku, name, price, and cost are required' });
    }

    const product = await prisma.product.create({
      data: {
        sku,
        name,
        description,
        price,
        cost,
        stockLevel: stockLevel ?? 0,
        minStock: minStock ?? 10,
        categoryId,
      },
      include: { category: true },
    });
    res.status(201).json(product);
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return res.status(409).json({ error: 'A product with this SKU already exists' });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { sku, name, description, price, cost, stockLevel, minStock, categoryId } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: { sku, name, description, price, cost, stockLevel, minStock, categoryId },
      include: { category: true },
    });
    res.json(product);
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (error?.code === 'P2002') {
      return res.status(409).json({ error: 'A product with this SKU already exists' });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.product.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found' });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
