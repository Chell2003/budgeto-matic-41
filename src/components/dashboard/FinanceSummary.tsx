
import React from 'react';
import { ArrowDownIcon, ArrowUpIcon, PiggyBank, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FinanceSummaryProps {
  balance: number;
  income: number;
  expenses: number;
  savings: number;
}

const FinanceSummary: React.FC<FinanceSummaryProps> = ({
  balance,
  income,
  expenses,
  savings,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));
  };

  const summary = [
    {
      title: 'Income',
      amount: income,
      icon: ArrowUpIcon,
      color: 'text-finance-income',
      bgColor: 'bg-finance-income/10',
    },
    {
      title: 'Expenses',
      amount: expenses,
      icon: ArrowDownIcon,
      color: 'text-finance-expense',
      bgColor: 'bg-finance-expense/10',
    },
    {
      title: 'Savings',
      amount: savings,
      icon: PiggyBank,
      color: 'text-finance-saving',
      bgColor: 'bg-finance-saving/10',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="overflow-hidden glass">
        <CardContent className="p-6">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Current Balance
              </p>
              <h2 className="text-3xl font-semibold tracking-tight mt-1">
                {formatCurrency(balance)}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {summary.map((item) => (
              <div key={item.title} className="space-y-1">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center", 
                  item.bgColor
                )}>
                  <item.icon size={16} className={item.color} />
                </div>
                <p className="text-xs font-medium text-muted-foreground">
                  {item.title}
                </p>
                <p className={cn("text-sm font-semibold", item.color)}>
                  {formatCurrency(item.amount)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceSummary;
