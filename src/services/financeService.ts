import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "@/components/dashboard/RecentTransactions";
import { 
  Budget, 
  SavingsGoal, 
  SavingsAllocation, 
  IncomeCategory,
  Profile
} from "@/types/database";

export { Budget, SavingsGoal };

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
  savings: 'bg-emerald-100',
  other: 'bg-slate-100',
  miscellaneous: 'bg-coral-100'
};

export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("transaction_date", { ascending: false }) as { data: any[] | null, error: any };

    if (error) {
      console.error("Error fetching transactions:", error);
      throw new Error(error.message);
    }

    if (!data) {
      return [];
    }

    // Make sure to map all properties including receipt_url
    return data.map((transaction: any) => ({
      id: transaction.id,
      description: transaction.description,
      amount: transaction.amount,
      category: transaction.category,
      date: transaction.transaction_date,
      receipt_url: transaction.receipt_url || null,
    })) as Transaction[];
  } catch (error) {
    console.error("Error in getTransactions:", error);
    throw error;
  }
};

export const uploadReceiptImage = async (file: File): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be logged in to upload receipt');
  }
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `${user.id}/${fileName}`;
  
  const { data, error } = await supabase.storage
    .from('receipts')
    .upload(filePath, file);
  
  if (error) {
    console.error('Error uploading receipt:', error);
    throw error;
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('receipts')
    .getPublicUrl(filePath);
  
  return publicUrl;
};

export const addTransaction = async (transaction: {
  amount: number;
  description: string;
  category: string;
  date: Date;
  receipt?: File;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be logged in to add a transaction');
  }

  // Check if this is an expense and if budgets exist
  if (transaction.amount < 0) {
    const { count } = await supabase
      .from('budgets')
      .select('id', { count: 'exact', head: true });
    
    if (count === 0) {
      throw new Error('You must create a budget before adding expenses');
    }
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

  let receiptUrl = null;
  if (transaction.receipt) {
    receiptUrl = await uploadReceiptImage(transaction.receipt);
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      amount: finalAmount,
      description: transaction.description,
      category: normalizedCategory,
      transaction_date: transaction.date.toISOString(),
      transaction_type: transactionType,
      receipt_url: receiptUrl
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
  
  return data;
};

export const updateTransaction = async (transaction: {
  id: string;
  description: string;
  amount: number;
  category: string;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be logged in to update a transaction');
  }

  let transactionType;
  if (transaction.category.startsWith('savings:')) {
    transactionType = 'savings';
  } else if (transaction.amount < 0) {
    transactionType = 'expense';
  } else {
    transactionType = 'income';
  }

  const { data, error } = await supabase
    .from('transactions')
    .update({
      description: transaction.description,
      amount: transaction.amount,
      category: transaction.category,
      transaction_type: transactionType
    })
    .eq('id', transaction.id)
    .eq('user_id', user.id) // Additional security to ensure user can only modify their own transactions
    .select()
    .single();
  
  if (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
  
  return data;
};

export const getBudgets = async () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Get income for percentage calculation
  const summary = await getFinancialSummary();
  const monthlyIncome = summary.income;

  const { data: budgets, error: budgetsError } = await supabase
    .from('budgets')
    .select('*')
    .eq('month', currentMonth)
    .eq('year', currentYear) as { data: Budget[] | null, error: any };

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
    .lte('transaction_date', endOfMonth) as { data: Transaction[] | null, error: any };

  if (transactionsError) {
    console.error('Error fetching transactions for budget:', transactionsError);
    throw transactionsError;
  }

  const spendingByCategory: Record<string, number> = {};
  
  if (transactions) {
    transactions.forEach(transaction => {
      const category = transaction.category.trim().toLowerCase();
      const amount = Math.abs(Number(transaction.amount));
      
      spendingByCategory[category] = (spendingByCategory[category] || 0) + amount;
    });
  }

  console.log('Spending by Category:', spendingByCategory);

  return (budgets || []).map(budget => {
    const normalizedBudgetCategory = budget.category.trim().toLowerCase();
    
    // Calculate allocated amount based on percentage of income
    let allocatedAmount = budget.allocated;
    if (monthlyIncome > 0 && budget.percentage) {
      allocatedAmount = (budget.percentage / 100) * monthlyIncome;
    }
    
    return {
      id: budget.id,
      category: budget.category,
      allocated: allocatedAmount,
      percentage: budget.percentage || 0,
      spent: spendingByCategory[normalizedBudgetCategory] || 0,
      color: categoryColors[normalizedBudgetCategory] || 'gray'
    };
  });
};

export const addBudget = async (budget: {
  category: string;
  allocated: number;
  percentage: number;
}) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be logged in to add a budget');
  }

  // Check total allocated percentage
  const { data: existingBudgets } = await supabase
    .from('budgets')
    .select('percentage')
    .eq('month', currentMonth)
    .eq('year', currentYear) as { data: Pick<Budget, 'percentage'>[] | null, error: any };

  const totalAllocatedPercentage = existingBudgets?.reduce((sum, item) => sum + (item.percentage || 0), 0) || 0;
  
  if (totalAllocatedPercentage + budget.percentage > 100) {
    throw new Error(`Cannot allocate more than 100% of income. ${(100 - totalAllocatedPercentage).toFixed(1)}% remaining.`);
  }

  const { data, error } = await supabase
    .from('budgets')
    .insert({
      user_id: user.id,
      category: budget.category,
      allocated: budget.allocated,
      percentage: budget.percentage,
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
    .gte('transaction_date', startOfMonth) as { data: Transaction[] | null, error: any };
  
  if (error) {
    console.error('Error fetching financial summary:', error);
    throw error;
  }
  
  let income = 0;
  let expenses = 0;
  let savings = 0;
  
  if (data) {
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
  }
  
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
    .order('created_at', { ascending: false }) as { data: SavingsGoal[] | null, error: any };

  if (error) {
    console.error('Error fetching savings goals:', error);
    throw error;
  }

  return (data || []).map(goal => {
    const targetAmount = Number(goal.target_amount);
    const currentAmount = Number(goal.current_amount || 0);
    const progress = (currentAmount / targetAmount) * 100;
    const remainingAmount = targetAmount - currentAmount;
    
    const now = new Date();
    const targetDate = new Date(goal.target_date);
    const daysRemaining = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const weeksRemaining = Math.ceil(daysRemaining / 7);
    const monthsRemaining = Math.ceil(daysRemaining / 30);

    let targetContribution;
    if ('target_contribution' in goal && goal.target_contribution !== null && goal.target_contribution !== undefined) {
      targetContribution = Number(goal.target_contribution);
    }

    return {
      ...goal,
      target_contribution: targetContribution,
      progress: Math.min(progress, 100),
      remaining_amount: remainingAmount > 0 ? remainingAmount : 0,
      time_remaining: {
        days: daysRemaining > 0 ? daysRemaining : 0,
        weeks: weeksRemaining > 0 ? weeksRemaining : 0,
        months: monthsRemaining > 0 ? monthsRemaining : 0,
      }
    } as SavingsGoal & {
      progress: number;
      remaining_amount: number;
      time_remaining: {
        days: number;
        weeks: number;
        months: number;
      };
    };
  });
};

export const addSavingsGoal = async (goal: {
  name: string;
  target_amount: number;
  current_amount?: number;
  target_date: Date;
  frequency: 'weekly' | 'monthly' | 'none';
  target_contribution?: number;
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
      target_contribution: goal.target_contribution || 0
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
  const { data: currentGoal, error: fetchError } = await supabase
    .from('savings_goals')
    .select('current_amount')
    .eq('id', goalId)
    .single() as { data: Pick<SavingsGoal, 'current_amount'> | null, error: any };

  if (fetchError) {
    console.error('Error fetching current savings goal amount:', fetchError);
    throw fetchError;
  }

  const newAmount = Number(currentGoal?.current_amount || 0) + amount;

  const { data, error } = await supabase
    .from('savings_goals')
    .update({ 
      current_amount: newAmount,
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

// New function to get savings allocations
export const getSavingsAllocations = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be logged in to get savings allocations');
  }

  const { data, error } = await supabase
    .from('savings_allocations')
    .select('*')
    .eq('user_id', user.id) as { data: SavingsAllocation[] | null, error: any };

  if (error) {
    console.error('Error fetching savings allocations:', error);
    throw error;
  }

  return data || [];
};

// New function to add a savings allocation
export const addSavingsAllocation = async (allocation: {
  name: string;
  percentage: number;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be logged in to add a savings allocation');
  }

  // Check total allocated percentage
  const { data: existingAllocations } = await supabase
    .from('savings_allocations')
    .select('percentage')
    .eq('user_id', user.id) as { data: Pick<SavingsAllocation, 'percentage'>[] | null, error: any };

  const totalAllocatedPercentage = existingAllocations?.reduce((sum, item) => sum + item.percentage, 0) || 0;
  
  if (totalAllocatedPercentage + allocation.percentage > 100) {
    throw new Error(`Cannot allocate more than 100% of savings. ${(100 - totalAllocatedPercentage).toFixed(1)}% remaining.`);
  }

  const { data, error } = await supabase
    .from('savings_allocations')
    .insert({
      user_id: user.id,
      name: allocation.name,
      percentage: allocation.percentage,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding savings allocation:', error);
    throw error;
  }
  
  return data;
};

// New function to update a savings allocation
export const updateSavingsAllocation = async (allocation: {
  id: string;
  name: string;
  percentage: number;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be logged in to update a savings allocation');
  }

  const { data, error } = await supabase
    .from('savings_allocations')
    .update({
      name: allocation.name,
      percentage: allocation.percentage,
      updated_at: new Date().toISOString()
    })
    .eq('id', allocation.id)
    .eq('user_id', user.id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating savings allocation:', error);
    throw error;
  }
  
  return data;
};

// New function to delete a savings allocation
export const deleteSavingsAllocation = async (id: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be logged in to delete a savings allocation');
  }

  const { error } = await supabase
    .from('savings_allocations')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
  
  if (error) {
    console.error('Error deleting savings allocation:', error);
    throw error;
  }
  
  return true;
};
