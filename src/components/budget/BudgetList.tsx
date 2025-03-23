
import React from 'react';
import { BudgetCategory } from './BudgetChart';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface BudgetListProps {
  budgetCategories: BudgetCategory[];
  onSelectCategory?: (categoryId: string) => void;
}

const BudgetList: React.FC<BudgetListProps> = ({ 
  budgetCategories,
  onSelectCategory
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {budgetCategories.map((category) => {
        const percentUsed = Math.round((category.spent / category.allocated) * 100);
        const isOverBudget = percentUsed > 100;
        
        return (
          <div 
            key={category.id}
            className="bg-white p-4 rounded-xl shadow-subtle press-effect"
            onClick={() => onSelectCategory && onSelectCategory(category.id)}
          >
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-medium">{category.name}</h4>
              <div className="text-right">
                <p className="text-sm font-semibold">
                  {formatCurrency(category.spent)} / {formatCurrency(category.allocated)}
                </p>
                <p className={cn(
                  "text-xs font-medium",
                  isOverBudget ? "text-finance-expense" : "text-muted-foreground"
                )}>
                  {isOverBudget ? 'Over budget' : `${percentUsed}% used`}
                </p>
              </div>
            </div>
            
            <Progress 
              value={Math.min(percentUsed, 100)} 
              className={cn(
                "h-2 mt-2",
                isOverBudget ? "bg-red-100" : "bg-gray-100"
              )}
              indicatorClassName={isOverBudget ? "bg-finance-expense" : undefined}
            />
          </div>
        );
      })}
      
      <button className="w-full py-3 bg-muted rounded-xl text-sm font-medium text-center text-muted-foreground hover:bg-muted/80 transition-colors">
        + Add Budget Category
      </button>
    </div>
  );
};

export default BudgetList;
