
import React from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import BudgetChart from '@/components/budget/BudgetChart';
import BudgetList from '@/components/budget/BudgetList';
import { budgetCategories } from '@/lib/data';

const Budget = () => {
  // Calculate total budget and total spent
  const totalBudget = budgetCategories.reduce((sum, category) => sum + category.allocated, 0);
  const totalSpent = budgetCategories.reduce((sum, category) => sum + category.spent, 0);

  return (
    <MobileLayout currentPage="budget">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Budget</h1>
        <p className="text-muted-foreground mt-1">Track your spending limits</p>
      </header>

      <BudgetChart 
        budgetCategories={budgetCategories}
        totalBudget={totalBudget}
        totalSpent={totalSpent}
      />

      <div className="mt-8">
        <h2 className="text-lg font-medium mb-4">Budget Categories</h2>
        <BudgetList budgetCategories={budgetCategories} />
      </div>
    </MobileLayout>
  );
};

export default Budget;
