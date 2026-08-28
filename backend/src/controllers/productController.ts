import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { ProductService } from '../services/product.service.js';

export const getProducts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const service = new ProductService(req.db);
    const products = await service.getAllProducts(req.query);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getProductById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const service = new ProductService(req.db);
    const product = await service.getProductById(req.params.id as string);
    if (!product) {
      return res.status(404).json({ error: 'Product not found or access denied' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

export const createProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sku, name, description, price, cost, stockLevel, minStock, categoryId } = req.body;

    if (!sku || !name || price == null || cost == null) {
      return res.status(400).json({ error: 'sku, name, price, and cost are required' });
    }

    const service = new ProductService(req.db);
    const product = await service.createProduct({
      sku, name, description, price, cost, 
      stockLevel: stockLevel ?? 0, 
      minStock: minStock ?? 10, 
      categoryId 
    });
    res.status(201).json(product);
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return res.status(409).json({ error: 'A product with this SKU already exists in your company' });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const service = new ProductService(req.db);
    const product = await service.updateProduct(req.params.id as string, req.body);
    res.json(product);
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found or access denied' });
    }
    if (error?.code === 'P2002') {
      return res.status(409).json({ error: 'A product with this SKU already exists in your company' });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const service = new ProductService(req.db);
    await service.deleteProduct(req.params.id as string);
    res.status(204).send();
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found or access denied' });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
