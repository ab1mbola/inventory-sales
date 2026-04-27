"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategories = void 0;
const prisma_1 = require("../utils/prisma");
const getCategories = async (_req, res) => {
    try {
        const categories = await prisma_1.prisma.category.findMany({
            orderBy: { name: 'asc' },
        });
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
};
exports.getCategories = getCategories;
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
        }
        const category = await prisma_1.prisma.category.create({
            data: { name, description },
        });
        res.status(201).json(category);
    }
    catch (error) {
        if (error?.code === 'P2002') {
            return res.status(409).json({ error: 'Category already exists' });
        }
        res.status(500).json({ error: 'Failed to create category' });
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, description } = req.body;
        const category = await prisma_1.prisma.category.update({
            where: { id },
            data: { name, description },
        });
        res.json(category);
    }
    catch (error) {
        if (error?.code === 'P2025') {
            return res.status(404).json({ error: 'Category not found' });
        }
        if (error?.code === 'P2002') {
            return res.status(409).json({ error: 'Category name already exists' });
        }
        res.status(500).json({ error: 'Failed to update category' });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    try {
        const id = req.params.id;
        await prisma_1.prisma.category.delete({ where: { id } });
        res.status(204).send();
    }
    catch (error) {
        if (error?.code === 'P2025') {
            return res.status(404).json({ error: 'Category not found' });
        }
        if (error?.code === 'P2003') {
            return res.status(409).json({ error: 'Cannot delete: category has products assigned' });
        }
        res.status(500).json({ error: 'Failed to delete category' });
    }
};
exports.deleteCategory = deleteCategory;
