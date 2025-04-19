import React, { useState, useEffect } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import BudgetChart from '@/components/budget/BudgetChart';
import BudgetList from '@/components/budget/BudgetList';
import { getBudgets, getFinancialSummary } from '@/services/financeService';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

const Budget = () => {
  const [budgetCategories, setBudgetCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [financialSummary, setFinancialSummary] = useState(null);
  const { user } = useAuth();

  const fetchBudgets = async () => {
    try {
      setIsLoading(true);
      const data = await getBudgets();
      setBudgetCategories(data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      toast.error('Failed to load budget data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFinancialSummary = async () => {
    try {
      const summary = await getFinancialSummary();
      setFinancialSummary(summary);
    } catch (error) {
      console.error('Error fetching financial summary:', error);
      toast.error('Failed to load financial summary');
    }
  };

  useEffect(() => {
    if (user) {
      fetchFinancialSummary();
      fetchBudgets();
    }
  }, [user]);

  // Calculate total budget and total spent
  const totalBudget = budgetCategories.reduce((sum, category) => sum + category.allocated, 0);
  const totalSpent = budgetCategories.reduce((sum, category) => sum + category.spent, 0);

  if (!financialSummary || financialSummary.income <= 0) {
    return (
      <MobileLayout currentPage="budget">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Budget</h1>
          <p className="text-muted-foreground mt-1">Track your spending limits</p>
        </header>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            You need to set your income first before creating a budget.
          </p>
          <button
            onClick={() => toast.info('Navigate to the income setup page.')}
            className="bg-primary text-white px-4 py-2 rounded-md"
          >
            Set Income
          </button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout currentPage="budget">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Budget</h1>
        <p className="text-muted-foreground mt-1">Track your spending limits</p>
      </header>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : budgetCategories.length > 0 ? (
        <>
          <BudgetChart 
            budgetCategories={budgetCategories}
            totalBudget={totalBudget}
            totalSpent={totalSpent}
          />

          <div className="mt-8">
            <h2 className="text-lg font-medium mb-4">Budget Categories</h2>
            <BudgetList 
              budgetCategories={budgetCategories} 
              onBudgetCreated={fetchBudgets}
            />
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No budget categories set up yet.</p>
          <BudgetList 
            budgetCategories={[]} 
            onBudgetCreated={fetchBudgets}
          />
        </div>
      )}
    </MobileLayout>
  );
};

export default Budget;
