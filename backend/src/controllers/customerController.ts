import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getCustomers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customers = await req.db.customer.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { sales: true }
        }
      }
    });
    res.json(customers);
  } catch (error) {
    console.error('Fetch Customers Error:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

export const createCustomer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, phone, address, creditLimit } = req.body;
    
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const customer = await req.db.customer.create({
      data: {
        name,
        email,
        phone,
        address,
        creditLimit: creditLimit ? Number(creditLimit) : null,
      },
    });
    res.json(customer);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Customer with this phone number already exists in your company' });
    }
    res.status(500).json({ error: 'Failed to create customer' });
  }
};

export const updateCustomer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, email, phone, address, creditLimit } = req.body;

    const customer = await req.db.customer.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        address,
        creditLimit: creditLimit ? Number(creditLimit) : null,
      },
    });
    res.json(customer);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Customer not found or access denied' });
    }
    res.status(500).json({ error: 'Failed to update customer' });
  }
};

export const deleteCustomer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await req.db.customer.delete({ where: { id } });
    res.json({ message: 'Customer deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Customer not found or access denied' });
    }
    res.status(500).json({ error: 'Failed to delete customer' });
  }
};
