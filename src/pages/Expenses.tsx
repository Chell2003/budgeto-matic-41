
import React, { useState, useEffect } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import { getTransactions, addTransaction } from '@/services/financeService';
import { expenseCategories } from '@/lib/data';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

const Expenses = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const data = await getTransactions();
        setTransactions(data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        toast.error('Failed to load transactions');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const handleAddExpense = async (expense: {
    amount: number;
    description: string;
    category: string;
    date: Date;
  }) => {
    try {
      await addTransaction(expense);
      // Refresh transactions after adding
      const updatedTransactions = await getTransactions();
      setTransactions(updatedTransactions);
      toast.success('Expense added successfully');
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense');
    }
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
        {isLoading ? (
          <div className="flex justify-center p-6">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : (
          <RecentTransactions transactions={transactions} />
        )}
      </div>
    </MobileLayout>
  );
};

export default Expenses;
