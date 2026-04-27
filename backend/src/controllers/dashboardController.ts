import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { startOfDay, endOfDay, subDays } from 'date-fns';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const sevenDaysAgo = startOfDay(subDays(now, 7));

    // 1. KPI Metrics
    const [todaySales, products, lowStockCount, creditSales] = await Promise.all([
      // Today's Sales & Profit
      prisma.sale.findMany({
        where: {
          createdAt: { gte: todayStart, lte: todayEnd }
        }
      }),
      // Total Products for context
      prisma.product.count(),
      // Low Stock Count
      prisma.product.count({
        where: {
          stockLevel: { lte: prisma.product.fields.minStock }
        }
      }),
      // Outstanding Credit (Total credit sales - this is a simple MVP version)
      prisma.sale.aggregate({
        where: { paymentMethod: 'CREDIT' },
        _sum: { totalAmount: true }
      })
    ]);

    const todayRevenue = todaySales.reduce((acc, sale) => acc + Number(sale.totalAmount), 0);
    const todayProfit = todaySales.reduce((acc, sale) => acc + (Number(sale.totalAmount) - Number(sale.totalCost)), 0);

    // 2. Sales Trend (Last 7 Days)
    const salesTrendRaw = await prisma.sale.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: sevenDaysAgo }
      },
      _sum: { totalAmount: true }
    });

    // Grouping by date manually since Prisma groupBy on DateTime includes time
    const trendMap = new Map();
    for (let i = 6; i >= 0; i--) {
      const dateStr = subDays(now, i).toISOString().split('T')[0];
      trendMap.set(dateStr, 0);
    }

    salesTrendRaw.forEach(item => {
      const dateStr = item.createdAt.toISOString().split('T')[0];
      if (trendMap.has(dateStr)) {
        trendMap.set(dateStr, trendMap.get(dateStr) + Number(item._sum.totalAmount || 0));
      }
    });

    const salesTrend = Array.from(trendMap.entries()).map(([date, amount]) => ({ date, amount }));

    // 3. Recent Sales
    const recentSales = await prisma.sale.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } }
    });

    // 4. Top Selling Products (by quantity)
    const topItemsRaw = await prisma.saleItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    });

    const topProducts = await Promise.all(
      topItemsRaw.map(async (item) => {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        return {
          name: product?.name || 'Unknown',
          quantity: item._sum.quantity,
          revenue: Number(product?.price || 0) * (item._sum.quantity || 0)
        };
      })
    );

    res.json({
      todayRevenue,
      todayProfit,
      lowStockCount,
      totalOutstandingCredit: Number(creditSales._sum.totalAmount || 0),
      salesTrend,
      recentSales,
      topProducts
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
};
