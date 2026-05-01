import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getCategories = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const categories = await req.db.category.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const createCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const category = await req.db.category.create({
      data: { 
        name, 
        description,
        companyId: req.user!.companyId
      },
    });
    res.status(201).json(category);
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return res.status(409).json({ error: 'Category already exists' });
    }
    res.status(500).json({ error: 'Failed to create category' });
  }
};

export const updateCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, description } = req.body;
    const category = await req.db.category.update({
      where: { id },
      data: { name, description },
    });
    res.json(category);
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return res.status(404).json({ error: 'Category not found' });
    }
    if (error?.code === 'P2002') {
      return res.status(409).json({ error: 'Category name already exists' });
    }
    res.status(500).json({ error: 'Failed to update category' });
  }
};

export const deleteCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await req.db.category.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return res.status(404).json({ error: 'Category not found' });
    }
    if (error?.code === 'P2003') {
      return res.status(409).json({ error: 'Cannot delete: category has products assigned' });
    }
    res.status(500).json({ error: 'Failed to delete category' });
  }
};
