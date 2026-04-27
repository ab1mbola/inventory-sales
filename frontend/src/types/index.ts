// ---- Enums ----
export type Role = 'OWNER' | 'MANAGER' | 'STAFF';
export type PaymentType = 'CASH' | 'CARD' | 'TRANSFER' | 'CREDIT';
export type SaleStatus = 'PENDING' | 'COMPLETED' | 'REFUNDED';

// ---- Models ----
export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  creditLimit?: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    sales: number;
  };
}

export interface CustomerPayment {
  id: string;
  customerId: string;
  amount: number;
  method: PaymentType;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  cost: number;
  stockLevel: number;
  minStock: number;
  categoryId?: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
  cost: number;
}

export interface Sale {
  id: string;
  totalAmount: number;
  totalCost: number;
  amountReceived?: number;
  changeAmount?: number;
  customerName?: string;
  customerPhone?: string;
  customerId?: string;
  customer?: Customer;
  paymentMethod: PaymentType;
  status: SaleStatus;
  userId?: string;
  items: SaleItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

// ---- API Payloads ----
export interface CreateProductPayload {
  sku: string;
  name: string;
  description?: string;
  price: number;
  cost: number;
  stockLevel: number;
  minStock: number;
  categoryId?: string;
}

export interface CreateSalePayload {
  paymentMethod: PaymentType;
  userId?: string;
  amountReceived?: number;
  changeAmount?: number;
  customerName?: string;
  customerPhone?: string;
  customerId?: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
    cost: number;
  }[];
}

export interface RecordPaymentPayload {
  customerId: string;
  amount: number;
  method: PaymentType;
  note?: string;
}

// ---- Dashboard ----
export interface DashboardData {
  todayRevenue: number;
  todayProfit: number;
  lowStockCount: number;
  totalOutstandingCredit: number;
  salesTrend: { date: string; amount: number }[];
  recentSales: Sale[];
  topProducts: { name: string; quantity: number; revenue: number }[];
}

// ---- Reports ----
export interface ReportData {
  monthlyPerformance: { month: string; revenue: number; profit: number }[];
  categoryDistribution: { name: string; value: number }[];
  paymentDistribution: { method: string; count: number; amount: number }[];
  inventoryStats: {
    totalItems: number;
    totalValue: number;
    totalCost: number;
  };
}

// ---- Debt ----
export interface DebtorStats {
  id: string;
  name: string;
  phone?: string;
  totalOwed: number;
  lastPaymentDate: string | null;
  creditLimit: number;
}

export interface CustomerDebtDetails extends Customer {
  sales: Sale[];
  payments: CustomerPayment[];
}
