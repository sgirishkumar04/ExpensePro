// ============================
// Core Interfaces for ExpensePro
// ============================

export interface User {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  profilePicture?: string;
  monthlySalary: number;
  currency: string;
  monthlyBudget?: number;
  isVerified: boolean;
  preferences: {
    darkMode: boolean;
    notifications: boolean;
    language: string;
  };
  createdAt: string;
}

export interface Account {
  _id: string;
  userId: string;
  name: string;
  type: 'Bank Account' | 'Cash Wallet' | 'Credit Card' | 'Debit Card' | 'UPI Wallet' | 'Savings Account' | 'Investment Account';
  balance: number;
  currency: string;
  color: string;
  icon: string;
  bankName?: string;
  accountNumber?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Category {
  _id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Expense {
  _id: string;
  userId: string;
  title: string;
  amount: number;
  category: Category;
  date: string;
  paymentMethod: 'Cash' | 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Bank Transfer' | 'Other';
  account?: Account;
  notes?: string;
  receiptUrl?: string;
  isRecurring?: boolean;
  recurringDay?: number;
  createdAt: string;
}

export interface Income {
  _id: string;
  userId: string;
  source: string;
  type: 'Salary' | 'Freelance' | 'Business' | 'Investment' | 'Bonus' | 'Gift' | 'Rental' | 'Side Income' | 'Other';
  amount: number;
  date: string;
  account?: Account;
  notes?: string;
  isRecurring?: boolean;
  recurringDay?: number;
  createdAt: string;
}

export interface Transfer {
  _id: string;
  userId: string;
  personName: string;
  amount: number;
  date: string;
  reason?: string;
  paymentType: 'UPI' | 'Bank Transfer' | 'Cash' | 'Cheque' | 'EMI' | 'Loan' | 'Other';
  fromAccount?: Account;
  status: 'Completed' | 'Pending' | 'Failed';
  createdAt: string;
}

export interface DashboardData {
  totalExpenses: number;
  totalIncome: number;
  totalTransfers: number;
  savings: number;
  totalBalance: number;
  highestAccount: Account | null;
  accounts: Account[];
  categoryBreakdown: CategoryBreakdownItem[];
  monthlyTrend: MonthlyTrend[];
  recentTransactions: (Expense | Income)[];
}

export interface CategoryBreakdownItem {
  _id: string;
  name: string;
  icon: string;
  color: string;
  total: number;
}

export interface MonthlyTrend {
  label: string;
  expenses: number;
  income: number;
  transfers: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ExpenseFilters {
  page?: number;
  limit?: number;
  category?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  paymentMethod?: string;
  search?: string;
}

export interface IncomeFilters {
  page?: number;
  limit?: number;
  type?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface TransferFilters {
  page?: number;
  limit?: number;
  paymentType?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface MonthlyReport {
  year: number;
  month: number;
  totalExpenses: number;
  totalIncome: number;
  totalTransfers: number;
  savings: number;
  expenses: Expense[];
  income: Income[];
  transfers: Transfer[];
  categoryBreakdown: CategoryBreakdownItem[];
}

export interface YearlyReport {
  year: number;
  monthlyData: MonthlyData[];
  categoryBreakdown: CategoryBreakdownItem[];
  totals: {
    expenses: number;
    income: number;
    transfers: number;
    savings: number;
  };
  highestExpenseMonth: MonthlyData;
  lowestExpenseMonth: MonthlyData;
  avgMonthlyExpense: number;
  avgMonthlySavings: number;
}

export interface MonthlyData {
  month: number;
  monthName: string;
  expenses: number;
  income: number;
  transfers: number;
  savings: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
}
