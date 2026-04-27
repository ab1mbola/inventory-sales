"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const prisma_1 = require("../utils/prisma");
const getProducts = async (req, res) => {
    try {
        const { search, categoryId, lowStock } = req.query;
        const where = {};
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
            where.stockLevel = { lte: prisma_1.prisma.product.fields?.minStock ?? 10 };
            // Use raw filter for column comparison
            const products = await prisma_1.prisma.$queryRaw `
        SELECT p.*, c.name as "categoryName"
        FROM "Product" p
        LEFT JOIN "Category" c ON p."categoryId" = c.id
        WHERE p."stockLevel" <= p."minStock"
        ORDER BY p."stockLevel" ASC
      `;
            return res.json(products);
        }
        const products = await prisma_1.prisma.product.findMany({
            where,
            include: { category: true },
            orderBy: { updatedAt: 'desc' },
        });
        res.json(products);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};
exports.getProducts = getProducts;
const getProductById = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await prisma_1.prisma.product.findUnique({
            where: { id },
            include: { category: true },
        });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
};
exports.getProductById = getProductById;
const createProduct = async (req, res) => {
    try {
        const { sku, name, description, price, cost, stockLevel, minStock, categoryId } = req.body;
        if (!sku || !name || price == null || cost == null) {
            return res.status(400).json({ error: 'sku, name, price, and cost are required' });
        }
        const product = await prisma_1.prisma.product.create({
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
    }
    catch (error) {
        if (error?.code === 'P2002') {
            return res.status(409).json({ error: 'A product with this SKU already exists' });
        }
        console.error(error);
        res.status(500).json({ error: 'Failed to create product' });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const { sku, name, description, price, cost, stockLevel, minStock, categoryId } = req.body;
        const product = await prisma_1.prisma.product.update({
            where: { id },
            data: { sku, name, description, price, cost, stockLevel, minStock, categoryId },
            include: { category: true },
        });
        res.json(product);
    }
    catch (error) {
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
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const id = req.params.id;
        await prisma_1.prisma.product.delete({ where: { id } });
        res.status(204).send();
    }
    catch (error) {
        if (error?.code === 'P2025') {
            return res.status(404).json({ error: 'Product not found' });
        }
        console.error(error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
};
exports.deleteProduct = deleteProduct;
