import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { startOfMonth, endOfMonth, subMonths, format, startOfYear } from 'date-fns';

export const getReportStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const sixMonthsAgo = startOfMonth(subMonths(now, 5));

    // 1. Monthly Revenue & Profit (Last 6 Months)
    const sales = await prisma.sale.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo }
      },
      orderBy: { createdAt: 'asc' }
    });

    const monthlyDataMap = new Map();
    for (let i = 5; i >= 0; i--) {
      const monthStr = format(subMonths(now, i), 'MMM yyyy');
      monthlyDataMap.set(monthStr, { month: monthStr, revenue: 0, profit: 0 });
    }

    sales.forEach(sale => {
      const monthStr = format(sale.createdAt, 'MMM yyyy');
      if (monthlyDataMap.has(monthStr)) {
        const data = monthlyDataMap.get(monthStr);
        data.revenue += Number(sale.totalAmount);
        data.profit += (Number(sale.totalAmount) - Number(sale.totalCost));
      }
    });

    const monthlyPerformance = Array.from(monthlyDataMap.values());

    // 2. Sales by Category
    const categorySalesRaw = await prisma.saleItem.findMany({
      include: {
        product: {
          include: { category: true }
        }
      }
    });

    const categoryMap = new Map();
    categorySalesRaw.forEach(item => {
      const catName = item.product?.category?.name || 'Uncategorized';
      const revenue = Number(item.price) * item.quantity;
      categoryMap.set(catName, (categoryMap.get(catName) || 0) + revenue);
    });

    const categoryDistribution = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));

    // 3. Payment Method Distribution
    const paymentDistributionRaw = await prisma.sale.groupBy({
      by: ['paymentMethod'],
      _count: { id: true },
      _sum: { totalAmount: true }
    });

    const paymentDistribution = paymentDistributionRaw.map(item => ({
      method: item.paymentMethod,
      count: item._count.id,
      amount: Number(item._sum.totalAmount || 0)
    }));

    // 4. Inventory Value
    const products = await prisma.product.findMany();
    const inventoryStats = {
      totalItems: products.reduce((acc, p) => acc + p.stockLevel, 0),
      totalValue: products.reduce((acc, p) => acc + (Number(p.price) * p.stockLevel), 0),
      totalCost: products.reduce((acc, p) => acc + (Number(p.cost) * p.stockLevel), 0),
    };

    res.json({
      monthlyPerformance,
      categoryDistribution,
      paymentDistribution,
      inventoryStats
    });
  } catch (error) {
    console.error('Report Error:', error);
    res.status(500).json({ error: 'Failed to fetch report statistics' });
  }
};
