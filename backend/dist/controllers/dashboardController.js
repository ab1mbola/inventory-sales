"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const prisma_1 = require("../utils/prisma");
const date_fns_1 = require("date-fns");
const getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        const todayStart = (0, date_fns_1.startOfDay)(now);
        const todayEnd = (0, date_fns_1.endOfDay)(now);
        const sevenDaysAgo = (0, date_fns_1.startOfDay)((0, date_fns_1.subDays)(now, 7));
        // 1. KPI Metrics
        const [todaySales, products, lowStockCount, creditSales] = await Promise.all([
            // Today's Sales & Profit
            prisma_1.prisma.sale.findMany({
                where: {
                    createdAt: { gte: todayStart, lte: todayEnd }
                }
            }),
            // Total Products for context
            prisma_1.prisma.product.count(),
            // Low Stock Count
            prisma_1.prisma.product.count({
                where: {
                    stockLevel: { lte: prisma_1.prisma.product.fields.minStock }
                }
            }),
            // Outstanding Credit (Total credit sales - this is a simple MVP version)
            prisma_1.prisma.sale.aggregate({
                where: { paymentMethod: 'CREDIT' },
                _sum: { totalAmount: true }
            })
        ]);
        const todayRevenue = todaySales.reduce((acc, sale) => acc + Number(sale.totalAmount), 0);
        const todayProfit = todaySales.reduce((acc, sale) => acc + (Number(sale.totalAmount) - Number(sale.totalCost)), 0);
        // 2. Sales Trend (Last 7 Days)
        const salesTrendRaw = await prisma_1.prisma.sale.groupBy({
            by: ['createdAt'],
            where: {
                createdAt: { gte: sevenDaysAgo }
            },
            _sum: { totalAmount: true }
        });
        // Grouping by date manually since Prisma groupBy on DateTime includes time
        const trendMap = new Map();
        for (let i = 6; i >= 0; i--) {
            const dateStr = (0, date_fns_1.subDays)(now, i).toISOString().split('T')[0];
            trendMap.set(dateStr, 0);
        }
        salesTrendRaw.forEach((item) => {
            const dateStr = item.createdAt.toISOString().split('T')[0];
            if (trendMap.has(dateStr)) {
                trendMap.set(dateStr, trendMap.get(dateStr) + Number(item._sum.totalAmount || 0));
            }
        });
        const salesTrend = Array.from(trendMap.entries()).map(([date, amount]) => ({ date, amount }));
        // 3. Recent Sales
        const recentSales = await prisma_1.prisma.sale.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { items: { include: { product: true } } }
        });
        // 4. Top Selling Products (by quantity)
        const topItemsRaw = await prisma_1.prisma.saleItem.groupBy({
            by: ['productId'],
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5
        });
        const topProducts = await Promise.all(topItemsRaw.map(async (item) => {
            const product = await prisma_1.prisma.product.findUnique({ where: { id: item.productId } });
            return {
                name: product?.name || 'Unknown',
                quantity: item._sum.quantity,
                revenue: Number(product?.price || 0) * (item._sum.quantity || 0)
            };
        }));
        res.json({
            todayRevenue,
            todayProfit,
            lowStockCount,
            totalOutstandingCredit: Number(creditSales._sum.totalAmount || 0),
            salesTrend,
            recentSales,
            topProducts
        });
    }
    catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
};
exports.getDashboardStats = getDashboardStats;
