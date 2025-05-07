
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export type BudgetCategory = {
  id: string;
  name?: string;
  category?: string;
  allocated: number;
  spent: number;
  percentage?: number;
  color: string;
};

interface BudgetChartProps {
  budgetCategories: BudgetCategory[];
  totalBudget: number;
  totalSpent: number;
  totalAllocatedPercentage: number;
}

const categoryColorHex: Record<string, string> = {
  shopping: '#e0bbf5',
  food: '#ffb347',
  coffee: '#d2691e',
  transport: '#1e90ff',
  housing: '#20b2aa',
  rent: '#6495ed',
  utilities: '#4682b4',
  entertainment: '#ff69b4',
  groceries: '#ffcc00',
  healthcare: '#98fb98',
  education: '#8a2be2',
  "personal care": '#dda0dd',
  bills: '#b0c4de',
  gifts: '#ff69b4',
  savings: '#50C878',
  other: '#708090',
  miscellaneous: '#ff7f50'
};

const BudgetChart: React.FC<BudgetChartProps> = ({ 
  budgetCategories, 
  totalBudget,
  totalSpent,
  totalAllocatedPercentage
}) => {
  const data = budgetCategories.map((category) => {
    const categoryName = category.category || category.name || '';
    const categoryKey = categoryName.toLowerCase();
    const colorHex = categoryColorHex[categoryKey] || category.color || '#64748b';
    
    return {
      name: categoryName,
      value: category.percentage || 0,
      color: colorHex,
    };
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const remainingBudget = totalBudget - totalSpent;
  const percentageSpent = Math.min(Math.round((totalSpent / totalBudget) * 100), 100);
  const remainingPercentage = 100 - totalAllocatedPercentage;

  return (
    <div className="bg-white dark:bg-background/80 rounded-2xl p-5 shadow-subtle flex flex-col items-center">
      <div className="text-center mb-2">
        <h3 className="text-lg font-semibold mb-1 dark:text-white">Monthly Budget</h3>
        <p className="text-sm text-muted-foreground dark:text-muted-foreground/80">
          {totalAllocatedPercentage.toFixed(1)}% of income allocated
        </p>
      </div>

      <div className="h-[200px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              label={({name, value}) => `${name}: ${value.toFixed(1)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="text-3xl font-bold">{percentageSpent}%</p>
          <p className="text-xs text-muted-foreground">used</p>
        </div>
      </div>

      <div className="mt-4 w-full flex justify-between text-sm border-t border-border/20 dark:border-border/30 pt-4">
        <div>
          <p className="text-muted-foreground dark:text-muted-foreground/80">Total Budget</p>
          <p className="font-semibold dark:text-white">{formatCurrency(totalBudget)}</p>
        </div>
        <div className="text-center">
          <p className="text-muted-foreground dark:text-muted-foreground/80">Remaining</p>
          <p className="font-semibold dark:text-white">{formatCurrency(remainingBudget)}</p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground dark:text-muted-foreground/80">Unallocated</p>
          <p className="font-semibold dark:text-white">{remainingPercentage.toFixed(1)}%</p>
        </div>
      </div>

      {remainingPercentage < 50 && (
        <div className="mt-4 p-3 bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200 rounded-lg text-sm">
          <p>Remember: It's recommended to allocate about 50% of your income to needs, but you can adjust based on your situation.</p>
        </div>
      )}
    </div>
  );
};

export default BudgetChart;
