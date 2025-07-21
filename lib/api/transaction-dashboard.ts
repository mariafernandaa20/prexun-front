import axiosInstance from "./axiosConfig";


export interface TransactionDashboardData {
  summary: {
    total_transactions: number;
    total_income: number;
    total_expenses: number;
    net_balance: number;
  };
  payment_method_totals: {
    cash: { income: number; expenses: number; net: number };
    card: { income: number; expenses: number; net: number };
    transfer: { income: number; expenses: number; net: number };
  };
  daily_summary: Array<{
    date: string;
    income: number;
    expenses: number;
    net: number;
  }>;
  campus_summary: Array<{
    campus_id: number;
    campus_name: string;
    income: number;
    expenses: number;
    net: number;
  }>;
  transactions: Array<{
    id: number;
    student_name: string;
    campus_name: string;
    transaction_type: 'income' | 'expense';
    amount: number;
    payment_method: 'cash' | 'card' | 'transfer';
    payment_date: string;
    notes?: string;
    folio?: string;
  }>;
}

export interface Campus {
  id: number;
  name: string;
}

export interface TransactionDashboardFilters {
  campus_id?: number;
  start_date?: string;
  end_date?: string;
  payment_method?: 'cash' | 'card' | 'transfer';
  transaction_type?: 'income' | 'expense';
}

export const transactionDashboardApi = {
  getData: async (filters: TransactionDashboardFilters = {}): Promise<TransactionDashboardData> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await axiosInstance.get(`/transaction-dashboard?${params.toString()}`);
    return response.data;
  },
  
  getCampuses: async (): Promise<Campus[]> => {
    const response = await axiosInstance.get('/transaction-dashboard/campuses');
    return response.data;
  }
};