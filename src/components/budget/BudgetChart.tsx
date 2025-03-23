
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export type BudgetCategory = {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  color: string;
};

interface BudgetChartProps {
  budgetCategories: BudgetCategory[];
  totalBudget: number;
  totalSpent: number;
}

const BudgetChart: React.FC<BudgetChartProps> = ({ 
  budgetCategories, 
  totalBudget,
  totalSpent
}) => {
  const data = budgetCategories.map((category) => ({
    name: category.name,
    value: category.allocated,
    color: category.color,
  }));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
