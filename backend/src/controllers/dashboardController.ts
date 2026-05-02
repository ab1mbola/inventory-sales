import { Response } from 'express';
import { startOfDay, endOfDay, subDays } from 'date-fns';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const sevenDaysAgo = startOfDay(subDays(now, 7));

    console.log('Fetching dashboard KPIs...');
    const [todaySales, totalProducts, lowStockCount, creditSales] = await Promise.all([
      req.db.sale.findMany({
        where: { createdAt: { gte: todayStart, lte: todayEnd } }
      }),
      req.db.product.count(),
      req.db.product.count({
        where: { stockLevel: { lte: 10 } }
      }),
      req.db.sale.aggregate({
        where: { paymentMethod: 'CREDIT' },
        _sum: { totalAmount: true }
      })
    ]);

    console.log('Calculating revenue...');
    const todayRevenue = todaySales.reduce((acc: number, sale: any) => acc + Number(sale.totalAmount), 0);
    const todayProfit = todaySales.reduce((acc: number, sale: any) => acc + (Number(sale.totalAmount) - Number(sale.totalCost)), 0);

    console.log('Fetching sales trend...');
    const salesTrendRaw = await req.db.sale.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: sevenDaysAgo } },
      _sum: { totalAmount: true }
    });

    const trendMap = new Map();
    for (let i = 6; i >= 0; i--) {
      const dateStr = subDays(now, i).toISOString().split('T')[0];
      trendMap.set(dateStr, 0);
    }

    salesTrendRaw.forEach((item: any) => {
      try {
        const dateStr = new Date(item.createdAt).toISOString().split('T')[0];
        if (trendMap.has(dateStr)) {
          trendMap.set(dateStr, trendMap.get(dateStr) + Number(item._sum.totalAmount || 0));
        }
      } catch (e) {
        console.warn('Error processing trend item:', item, e);
      }
    });

    const salesTrend = Array.from(trendMap.entries()).map(([date, amount]) => ({ date, amount }));

    console.log('Fetching recent sales...');
    const recentSales = await req.db.sale.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } }
    });

    console.log('Fetching top products via manual aggregation...');
    // We fetch recent sales with items and group manually to avoid issues with models missing companyId
    const recentSalesForTop = await req.db.sale.findMany({
      take: 100, // Look at last 100 sales to get meaningful top products
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } }
    });

    const productStatsMap = new Map();
    recentSalesForTop.forEach((sale: any) => {
      sale.items.forEach((item: any) => {
        const productId = item.productId;
        if (!productStatsMap.has(productId)) {
          productStatsMap.set(productId, { name: item.product?.name || 'Unknown', quantity: 0, revenue: 0 });
        }
        const stats = productStatsMap.get(productId);
        stats.quantity += item.quantity;
        stats.revenue += Number(item.price) * item.quantity;
      });
    });

    const topProducts = Array.from(productStatsMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    console.log('Dashboard data ready.');
    res.json({
      todayRevenue,
      todayProfit,
      lowStockCount,
      totalOutstandingCredit: Number(creditSales?._sum?.totalAmount || 0),
      salesTrend,
      recentSales,
      topProducts
    });
  } catch (error) {
    console.error('CRITICAL DASHBOARD ERROR:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
};
