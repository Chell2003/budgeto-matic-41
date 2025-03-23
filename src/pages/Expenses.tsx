
import React, { useState } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import { 
  expenseCategories, 
  transactions as initialTransactions,
  addExpense
} from '@/lib/data';
import { toast } from 'sonner';

const Expenses = () => {
  const [transactions, setTransactions] = useState(initialTransactions);

  const handleAddExpense = (expense: {
    amount: number;
    description: string;
    category: string;
    date: Date;
  }) => {
    const updatedTransactions = addExpense(transactions, expense);
    setTransactions(updatedTransactions);
    toast.success('Expense added successfully');
  };

  return (
    <MobileLayout currentPage="expenses">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <p className="text-muted-foreground mt-1">Track and manage your spending</p>
      </header>

      <ExpenseForm 
        categories={expenseCategories}
        onAddExpense={handleAddExpense}
      />

      <div className="mt-8">
        <RecentTransactions transactions={transactions} />
      </div>
    </MobileLayout>
  );
};

export default Expenses;
