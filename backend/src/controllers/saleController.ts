import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const getSales = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sales = await req.db.sale.findMany({
      include: {
        items: {
          include: { product: true }
        },
        customer: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
};

export const createSale = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      items, 
      paymentMethod, 
      amountReceived, 
      changeAmount, 
      customerName, 
      customerPhone,
      customerId
    } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Sale must contain at least one item' });
    }

    const totalAmount = items.reduce((sum: number, item: any) => sum + (Number(item.price) * Number(item.quantity)), 0);
    const totalCost = items.reduce((sum: number, item: any) => sum + (Number(item.cost) * Number(item.quantity)), 0);

    const sale = await req.db.$transaction(async (tx: any) => {
      const newSale = await tx.sale.create({
        data: {
          totalAmount,
          totalCost,
          paymentMethod,
          amountReceived: amountReceived ? Number(amountReceived) : null,
          changeAmount: changeAmount ? Number(changeAmount) : null,
          customerName: customerName || null,
          customerPhone: customerPhone || null,
          customerId: customerId || null,
          userId: req.user?.id || null,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: Number(item.quantity),
              price: Number(item.price),
              cost: Number(item.cost),
              companyId: req.user!.companyId // Explicit injection for nested create
            }))
          }
        },
        include: { 
          items: {
            include: { product: true }
          },
          customer: true
        }
      });

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockLevel: { decrement: Number(item.quantity) } }
        });
      }

      return newSale;
    }, {
      maxWait: 20000,
      timeout: 20000
    });

    res.status(201).json(sale);
  } catch (error) {
    console.error('Sale creation error:', error);
    res.status(500).json({ error: 'Failed to process sale. Check stock levels or database connectivity.' });
  }
};
