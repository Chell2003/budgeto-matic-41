
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "@/components/dashboard/RecentTransactions";

export interface Budget {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  color: string;
}

// Transactions
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
  // Get the current user's ID
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be logged in to add a transaction');
  }

  // Normalize category for consistent matching
  const normalizedCategory = transaction.category.trim().toLowerCase();

  let transactionType;
  let finalAmount = transaction.amount;
  
  if (normalizedCategory.startsWith('savings:')) {
    transactionType = 'expense';
    finalAmount = -Math.abs(transaction.amount);
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

// Budgets
export const getBudgets = async () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Fetch budgets for current month/year
  const { data: budgets, error: budgetsError } = await supabase
    .from('budgets')
    .select('*')
    .eq('month', currentMonth)
    .eq('year', currentYear);

  if (budgetsError) {
    console.error('Error fetching budgets:', budgetsError);
    throw budgetsError;
  }

  // Fetch transactions in the current month to calculate spending
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


  // Calculate spending by category
  const spendingByCategory: Record<string, number> = {};
  
  transactions.forEach(transaction => {
    // Normalize category for consistent matching
    const category = transaction.category.trim().toLowerCase();
    const amount = Math.abs(Number(transaction.amount));
    
    spendingByCategory[category] = (spendingByCategory[category] || 0) + amount;
  });

  // Default colors for categories
  console.log('Spending by Category:', spendingByCategory);

  // Default colors for categories
  const categoryColors: Record<string, string> = {
    shopping: 'purple',
    food: 'orange',
    transport: 'blue',
    housing: 'teal',
    entertainment: 'pink',
    utilities: 'gray',
    health: 'red',
    education: 'yellow',
    subscription: 'indigo',
    other: 'slate'
  };

  // Map budgets with spending
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
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentYear = currentDate.getFullYear();

  // Get the current user's ID
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

// Financial summary
export const getFinancialSummary = async () => {
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
  
  // Get all transactions for the current month
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
    
    if (transaction.category.startsWith('savings:')) {
      // Identify savings by category prefix
      savings += Math.abs(amount);
    } else if (transaction.transaction_type === 'income') {
      income += Math.abs(amount);
    } else if (transaction.transaction_type === 'expense' && !transaction.category.startsWith('savings:')) {
      expenses += Math.abs(amount);
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
