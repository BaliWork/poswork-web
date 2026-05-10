export type UserRole = "superadmin" | "admin" | "supervisor";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  merchant?: string;
}

export interface Merchant {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  prices: number[];
}

export interface OrderDetail {
  description: string | null;
  grand_total: number;
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  sub_total: number;
}

export type PaymentType = "CASH" | "NON_CASH";
export type OrderStatus = "PAID" | "PENDING" | "CANCELLED";

export interface Order {
  counter: number;
  created_by: string;
  customer_name: string;
  id: string;
  money_received: number;
  order_date: string;
  order_details: OrderDetail[];
  order_number: string;
  payment_type: PaymentType;
  status: OrderStatus;
  sub_total: number;
  total_payment: number;
}

export interface OpeningBalance {
  id: string;
  balance: number;
  created_by: string;
  date: string;
}

export interface ClosingBalance {
  cahsier_name: string;
  cashier_balance: number;
  closing_date: string;
  duration: string;
  net_amount: number;
  opening_balance: number;
  total_cash: number;
  total_non_cash: number;
}

export interface Sale {
  id: string; // date string, e.g. "2026-04-18"
  opening_balance: OpeningBalance;
  closing_balance?: ClosingBalance;
  orders: Order[];
}

export interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  note?: string;
  createdAt: string;
}

export type ExpenseFormValues = Omit<Expense, "id" | "createdAt">;

export interface Cashier {
  id: string; // PIN code (4-digit string), used as Firestore document ID
  name: string;
  createdAt: string; // ISO date string, e.g. "2026-05-10"
  updatedAt: string | null;
}

export type CashierFormValues = Omit<Cashier, "id" | "createdAt" | "updatedAt">;

export interface ProfitLossSummary {
  period: string;          // e.g., "2026"
  totalRevenue: number;    // Total revenue (rupiah)
  totalExpenses: number;   // Total expenses (rupiah)
  netProfit: number;       // totalRevenue - totalExpenses (can be negative)
  isProfit: boolean;       // netProfit >= 0
}

export interface MonthlyBreakdown {
  month: string;           // e.g., "Januari"
  revenue: number;
  expenses: number;
  netProfit: number;
}
