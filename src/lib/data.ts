
import { Transaction } from '@/components/dashboard/RecentTransactions';
import { ExpenseCategory } from '@/components/expenses/CategorySelector';
import { BudgetCategory } from '@/components/budget/BudgetChart';

// Helper function to generate a UUID
const generateId = () => {
  return Math.random().toString(36).substring(2, 15);
};

// Mock categories
export const expenseCategories: ExpenseCategory[] = [
  {
    id: '1',
    name: 'Food',
    icon: 'utensils',
    color: 'orange',
  },
  {
    id: '2',
    name: 'Transport',
    icon: 'car',
    color: 'blue',
  },
  {
    id: '3',
    name: 'Shopping',
    icon: 'shoppingBag',
    color: 'purple',
  },
  {
    id: '4',
    name: 'Housing',
    icon: 'home',
    color: 'teal',
  },
  {
    id: '5',
    name: 'Coffee',
    icon: 'coffee',
    color: 'amber',
  },
  {
    id: '6',
    name: 'Gifts',
    icon: 'gift',
    color: 'pink',
  },
  {
    id: '7',
    name: 'Bills',
    icon: 'creditCard',
    color: 'gray',
  },
  {
    id: '8',
    name: 'Other',
    icon: 'plus',
    color: 'gray',
  },
];

// Income categories
export const incomeCategories: ExpenseCategory[] = [
  {
    id: 'income-1',
    name: 'Salary',
    icon: 'briefcase',
    color: 'green',
  },
  {
    id: 'income-2',
    name: 'Allowance',
    icon: 'wallet',
    color: 'emerald',
  },
  {
    id: 'income-3',
    name: 'Cash Savings',
    icon: 'piggyBank',
    color: 'teal',
  },
  {
    id: 'income-4',
    name: 'Extra Income',
    icon: 'dollarSign',
    color: 'cyan',
  },
  {
    id: 'income-5',
    name: 'Fund Transfer',
    icon: 'arrowRightLeft',
    color: 'sky',
  },
  {
    id: 'income-6',
    name: 'Government Aid',
    icon: 'shield',
    color: 'blue',
  },
  {
    id: 'income-7',
    name: 'Insurance',
    icon: 'shieldCheck',
    color: 'indigo',
  },
  {
    id: 'income-8',
    name: 'Pension',
    icon: 'userCheck',
    color: 'violet',
  },
  {
    id: 'income-9',
    name: 'Remittance',
    icon: 'send',
    color: 'purple',
  },
  {
    id: 'income-10',
    name: 'Others',
    icon: 'helpCircle',
    color: 'gray',
  },
  {
    id: 'income-11',
    name: 'Uncategorized',
    icon: 'helpCircle',
    color: 'slate',
  },
];

// Mock transactions
export const transactions: Transaction[] = [
  {
    id: '1',
    date: '2023-07-15',
    description: 'Grocery Store',
    amount: -82.45,
    category: 'food',
  },
  {
    id: '2',
    date: '2023-07-14',
    description: 'Monthly Salary',
    amount: 3200.00,
    category: 'salary',
  },
  {
    id: '3',
    date: '2023-07-13',
    description: 'Uber Ride',
    amount: -24.30,
    category: 'transport',
  },
  {
    id: '4',
    date: '2023-07-12',
    description: 'Starbucks',
    amount: -5.40,
    category: 'coffee',
  },
  {
    id: '5',
    date: '2023-07-10',
    description: 'Amazon Purchase',
    amount: -67.99,
    category: 'shopping',
  },
];

// Mock budget categories
export const budgetCategories: BudgetCategory[] = [
  {
    id: '1',
    name: 'Food & Dining',
    allocated: 500,
    spent: 350,
    color: '#FF9800',
  },
  {
    id: '2',
    name: 'Transportation',
    allocated: 300,
    spent: 220,
    color: '#2196F3',
  },
  {
    id: '3',
    name: 'Shopping',
    allocated: 200,
    spent: 240,
    color: '#9C27B0',
  },
  {
    id: '4',
    name: 'Bills & Utilities',
    allocated: 400,
    spent: 400,
    color: '#607D8B',
  },
  {
    id: '5',
    name: 'Entertainment',
    allocated: 150,
    spent: 80,
    color: '#E91E63',
  },
];

// Mock financial summary
export const financialSummary = {
  balance: 4260.85,
  income: 3450.00,
  expenses: -1240.50,
  savings: 800.00,
};

// Helper function to add a new transaction
export const addTransaction = (
  currentTransactions: Transaction[],
  newTransaction: Omit<Transaction, 'id'> & { id?: string }
): Transaction[] => {
  const transaction = {
    id: newTransaction.id || generateId(),
    ...newTransaction,
  };
  
  return [transaction, ...currentTransactions];
};

// Helper function to add an expense (negative transaction)
export const addExpense = (
  currentTransactions: Transaction[],
  { amount, description, category, date }: { 
    amount: number; 
    description: string; 
    category: string; 
    date: Date;
  }
): Transaction[] => {
  const categoryObj = expenseCategories.find(cat => cat.id === category);
  
  const newTransaction: Transaction = {
    id: generateId(),
    date: date.toISOString().split('T')[0],
    description,
    amount: amount < 0 ? amount : -amount, // Ensure amount is negative
    category: categoryObj?.icon.toLowerCase() || 'shopping',
  };
  
  return [newTransaction, ...currentTransactions];
};

// Helper function to update financial summary based on new transactions
export const updateFinancialSummary = (
  summary: typeof financialSummary,
  transaction: Transaction
): typeof financialSummary => {
  const updatedSummary = { ...summary };
  
  if (transaction.amount > 0) {
    updatedSummary.income += transaction.amount;
  } else {
    updatedSummary.expenses += transaction.amount;
  }
  
  updatedSummary.balance += transaction.amount;
  
  return updatedSummary;
};
