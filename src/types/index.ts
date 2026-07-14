export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  role: 'admin' | 'staff';
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  todaySales: number;
  todayTransactions: number;
  totalProducts: number;
  lowStockCount: number;
  totalCustomers: number;
  outstandingCredit: number;
  todayProfit: number;
  monthSales: number;
}

export interface CreditSummary {
  customerId: string;
  customerName: string;
  customerMobile: string;
  totalPurchases: number;
  totalCredit: number;
  totalPaid: number;
  remainingBalance: number;
  lastPaymentDate: Date | null;
  lastPurchaseDate: Date | null;
  creditBills: number;
  creditStatus: 'none' | 'active' | 'settled';
}

export interface LedgerEntry {
  date: Date;
  type: 'sale' | 'payment';
  invoiceNumber: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}
