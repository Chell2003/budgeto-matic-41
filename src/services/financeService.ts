import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "@/components/dashboard/RecentTransactions";

export interface Budget {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  color: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  start_date: string;
  target_date: string;
  frequency: 'weekly' | 'monthly' | 'none';
  category: string;
  created_at: string;
  updated_at: string;
  progress: number;
  remaining_amount: number;
  time_remaining: {
    days: number;
    weeks: number;
    months: number;
  };
}

const categoryColors: Record<string, string> = {
  shopping: 'bg-purple-100',
  food: 'bg-orange-100',
  coffee: 'bg-amber-100',
  transport: 'bg-blue-100',
  housing: 'bg-teal-100',
  rent: 'bg-cornflower-blue-100',
  utilities: 'bg-blue-100',
  entertainment: 'bg-pink-100',
  healthcare: 'bg-green-100',
  education: 'bg-indigo-100',
  "personal care": 'bg-violet-100',
  bills: 'bg-gray-100',
  gifts: 'bg-pink-100',
  other: 'bg-slate-100',
  miscellaneous: 'bg-coral-100'
};

export const getTransactions = async () => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('transaction_date', { ascending: false });
  
  if (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
  
  return data.map(transaction => ({
    id: transaction.id,
    description: transaction.description,
    amount: transaction.amount,
    category: transaction.category,
    date: transaction.transaction_date,
  })) as Transaction[];
};

export const addTransaction = async (transaction: {
  amount: number;
  description: string;
  category: string;
  date: Date;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be logged in to add a transaction');
  }

  const normalizedCategory = transaction.category.trim().toLowerCase();

  let transactionType;
  let finalAmount = transaction.amount;
  
  if (normalizedCategory.startsWith('savings:')) {
    transactionType = 'savings';
    finalAmount = Math.abs(transaction.amount);
    
    if (normalizedCategory.startsWith('savings:goal:')) {
      const goalId = normalizedCategory.split(':')[2];
      if (goalId) {
        await updateSavingsGoalAmount(goalId, finalAmount);
      }
    }
  } else if (transaction.amount < 0) {
    transactionType = 'expense';
  } else {
    transactionType = 'income';
  }

  console.log('Adding transaction:', {
    category: normalizedCategory,
    amount: finalAmount,
    type: transactionType
  });

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      amount: finalAmount,
      description: transaction.description,
      category: normalizedCategory,
      transaction_date: transaction.date.toISOString(),
      transaction_type: transactionType
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
  
  return data;
};

export const getBudgets = async () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const { data: budgets, error: budgetsError } = await supabase
    .from('budgets')
    .select('*')
    .eq('month', currentMonth)
    .eq('year', currentYear);

  if (budgetsError) {
    console.error('Error fetching budgets:', budgetsError);
    throw budgetsError;
  }

  const startOfMonth = new Date(currentYear, currentMonth - 1, 1).toISOString();
  const endOfMonth = new Date(currentYear, currentMonth, 0).toISOString();
  
  const { data: transactions, error: transactionsError } = await supabase
    .from('transactions')
    .select('*')
    .eq('transaction_type', 'expense')
    .gte('transaction_date', startOfMonth)
    .lte('transaction_date', endOfMonth);

  if (transactionsError) {
    console.error('Error fetching transactions for budget:', transactionsError);
    throw transactionsError;
  }

  const spendingByCategory: Record<string, number> = {};
  
  transactions.forEach(transaction => {
    const category = transaction.category.trim().toLowerCase();
    const amount = Math.abs(Number(transaction.amount));
    
    spendingByCategory[category] = (spendingByCategory[category] || 0) + amount;
  });

  console.log('Spending by Category:', spendingByCategory);

  return budgets.map(budget => {
    const normalizedBudgetCategory = budget.category.trim().toLowerCase();
    return {
      id: budget.id,
      category: budget.category,
      allocated: Number(budget.allocated),
      spent: spendingByCategory[normalizedBudgetCategory] || 0,
      color: categoryColors[normalizedBudgetCategory] || 'gray'
    };
  }) as Budget[];
};

export const addBudget = async (budget: {
  category: string;
  allocated: number;
}) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be logged in to add a budget');
  }

  const { data, error } = await supabase
    .from('budgets')
    .insert({
      user_id: user.id,
      category: budget.category,
      allocated: budget.allocated,
      month: currentMonth,
      year: currentYear
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding budget:', error);
    throw error;
  }
  
  return data;
};

export const getFinancialSummary = async () => {
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
  
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .gte('transaction_date', startOfMonth);
  
  if (error) {
    console.error('Error fetching financial summary:', error);
    throw error;
  }
  
  let income = 0;
  let expenses = 0;
  let savings = 0;
  
  data.forEach(transaction => {
    const amount = Number(transaction.amount);
    
    switch (transaction.transaction_type) {
      case 'savings':
        savings += amount;
        break;
      case 'income':
        income += amount;
        break;
      case 'expense':
        expenses += Math.abs(amount);
        break;
    }
  });
  
  const balance = income - expenses;
  
  return {
    balance,
    income,
    expenses,
    savings
  };
};

export const getSavingsGoals = async () => {
  const { data, error } = await supabase
    .from('savings_goals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching savings goals:', error);
    throw error;
  }

  return data.map(goal => {
    const targetAmount = Number(goal.target_amount);
    const currentAmount = Number(goal.current_amount);
    const progress = (currentAmount / targetAmount) * 100;
    const remainingAmount = targetAmount - currentAmount;
    
    const now = new Date();
    const targetDate = new Date(goal.target_date);
    const daysRemaining = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const weeksRemaining = Math.ceil(daysRemaining / 7);
    const monthsRemaining = Math.ceil(daysRemaining / 30);

    return {
      ...goal,
      progress: Math.min(progress, 100),
      remaining_amount: remainingAmount > 0 ? remainingAmount : 0,
      time_remaining: {
        days: daysRemaining > 0 ? daysRemaining : 0,
        weeks: weeksRemaining > 0 ? weeksRemaining : 0,
        months: monthsRemaining > 0 ? monthsRemaining : 0,
      }
    } as SavingsGoal;
  });
};

export const addSavingsGoal = async (goal: {
  name: string;
  target_amount: number;
  current_amount?: number;
  target_date: Date;
  frequency: 'weekly' | 'monthly' | 'none';
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be logged in to add a savings goal');
  }

  const { data, error } = await supabase
    .from('savings_goals')
    .insert({
      user_id: user.id,
      name: goal.name,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount || 0,
      target_date: goal.target_date.toISOString(),
      frequency: goal.frequency,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding savings goal:', error);
    throw error;
  }

  return data;
};

export const updateSavingsGoalAmount = async (goalId: string, amount: number) => {
  const { data, error } = await supabase
    .from('savings_goals')
    .update({ 
      current_amount: supabase.rpc('increment_savings_goal', { goal_id: goalId, amount }),
      updated_at: new Date().toISOString()
    })
    .eq('id', goalId)
    .select()
    .single();

  if (error) {
    console.error('Error updating savings goal:', error);
    throw error;
  }

  return data;
};

export const deleteSavingsGoal = async (goalId: string) => {
  const { error } = await supabase
    .from('savings_goals')
    .delete()
    .eq('id', goalId);

  if (error) {
    console.error('Error deleting savings goal:', error);
    throw error;
  }

  return true;
};
