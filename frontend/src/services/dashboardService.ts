import { api } from './api';

export interface DashboardData {
  todayRevenue: number;
  todayProfit: number;
  lowStockCount: number;
  totalOutstandingCredit: number;
  salesTrend: { date: string; amount: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
  recentSales: {
    id: string;
    customerName: string;
    totalAmount: number;
    paymentMethod: string;
    createdAt: string;
  }[];
}

export const dashboardService = {
  getStats: () =>
    api.get<DashboardData>('/dashboard/stats').then((r) => r.data),
};
