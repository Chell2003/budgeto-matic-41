
import React from 'react';
import { 
  ShoppingBag, Coffee, Car, Home, Gift, 
  Utensils, Briefcase, Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Type for transaction data
export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

// Map of category to icon
const categoryIcons: Record<string, React.ElementType> = {
  shopping: ShoppingBag,
  food: Utensils,
  coffee: Coffee,
  transport: Car,
  housing: Home,
  gifts: Gift,
  salary: Briefcase,
  subscription: Smartphone,
};

// Map of category to background color
const categoryColors: Record<string, string> = {
  shopping: 'bg-purple-100',
  food: 'bg-orange-100',
  coffee: 'bg-amber-100',
  transport: 'bg-blue-100',
  housing: 'bg-teal-100',
  gifts: 'bg-pink-100',
  salary: 'bg-green-100',
  subscription: 'bg-gray-100',
};

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Recent Transactions</h3>
        <button className="text-sm text-primary font-medium">
          View All
        </button>
      </div>

      <div className="space-y-3">
        {transactions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No transactions yet
          </div>
        ) : (
          transactions.map((transaction) => {
            const Icon = categoryIcons[transaction.category] || ShoppingBag;
            const bgColor = categoryColors[transaction.category] || 'bg-gray-100';
            const isExpense = transaction.amount < 0;

            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white shadow-subtle press-effect"
              >
                <div className="flex items-center">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mr-3", bgColor)}>
                    <Icon size={18} className="text-foreground opacity-75" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
                  </div>
                </div>
                <p className={cn(
                  "font-medium",
                  isExpense ? "text-finance-expense" : "text-finance-income"
                )}>
                  {isExpense ? "-" : "+"}{formatCurrency(transaction.amount)}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecentTransactions;
