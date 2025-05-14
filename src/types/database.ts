
export interface Profile {
  id: string;
  full_name?: string | null;
  username?: string | null;
  avatar_url?: string | null;
  income_source?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category: string;
  transaction_date: string;
  transaction_type: string;
  receipt_url?: string | null;
  created_at?: string | null;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  allocated: number;
  percentage?: number | null;
  month: number;
  year: number;
  created_at?: string | null;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount?: number | null;
  target_date: string;
  frequency: string;
  target_contribution?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface SavingsAllocation {
  id: string;
  user_id: string;
  name: string;
  percentage: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface IncomeCategory {
  id: string;
  name: string;
  created_at?: string | null;
}
