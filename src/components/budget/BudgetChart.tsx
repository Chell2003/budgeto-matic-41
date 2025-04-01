
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export type BudgetCategory = {
  id: string;
  name?: string;
  category?: string;
  allocated: number;
  spent: number;
  color: string;
};

interface BudgetChartProps {
  budgetCategories: BudgetCategory[];
  totalBudget: number;
  totalSpent: number;
}

// Map of category to color hex values - ensuring consistency with CategorySelector
const categoryColorHex: Record<string, string> = {
  shopping: '#9b87f5', // purple
  food: '#f97316',     // orange
  coffee: '#f59e0b',   // amber
  transport: '#3b82f6', // blue
  housing: '#0d9488',   // teal
  rent: '#0d9488',      // same as housing
  utilities: '#3b82f6', // blue
  entertainment: '#ec4899', // pink
  groceries: '#f97316',     // same as food
  healthcare: '#22c55e',    // green
  education: '#6366f1',     // indigo
  "personal care": '#8b5cf6', // violet
  bills: '#6b7280',          // gray
  gifts: '#ec4899',          // pink
  other: '#64748b',          // slate
  miscellaneous: '#64748b'   // slate
};

const BudgetChart: React.FC<BudgetChartProps> = ({ 
  budgetCategories, 
  totalBudget,
  totalSpent
}) => {
  const data = budgetCategories.map((category) => {
    // Get the category name, handling both possible properties
    const categoryName = category.category || category.name || '';
    // Convert category name to lowercase for consistent mapping
    const categoryKey = categoryName.toLowerCase();
    // Use the color from our map, or fall back to the category's color or a default
    const colorHex = categoryColorHex[categoryKey] || category.color || '#64748b';
    
    return {
      name: categoryName,
      value: category.allocated,
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

  return (
    <div className="bg-white rounded-2xl p-5 shadow-subtle flex flex-col items-center">
      <div className="text-center mb-2">
        <h3 className="text-lg font-semibold mb-1">Monthly Budget</h3>
        <p className="text-sm text-muted-foreground">
          {formatCurrency(totalSpent)} of {formatCurrency(totalBudget)} used
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

      <div className="mt-4 w-full flex justify-between text-sm border-t pt-4">
        <div>
          <p className="text-muted-foreground">Remaining</p>
          <p className="font-semibold">{formatCurrency(remainingBudget)}</p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground">Next Reset</p>
          <p className="font-semibold">24 days</p>
        </div>
      </div>
    </div>
  );
};

export default BudgetChart;
