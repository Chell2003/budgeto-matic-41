import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { 
  DollarSign, ShoppingBag, Coffee, Car, Home, Gift, 
  Utensils, Briefcase, Smartphone, Plus, PiggyBank, 
  ArrowRightLeft, Target, FileImage
} from 'lucide-react';
import { Budget } from '@/services/financeService';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  receipt_url?: string | null;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  budgets?: Budget[];
  onCategoryClick?: (category: string) => void;
  onTransactionUpdated?: () => void;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ 
  transactions,
  budgets = [],
  onCategoryClick,
  onTransactionUpdated
}) => {
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTransactionIcon = (category: string) => {
    category = category.toLowerCase();
    
    if (category.startsWith('savings:')) {
      if (category.includes('goal')) {
        return <Target className="text-purple-500" />;
      }
      return <PiggyBank className="text-green-500" />;
    }
    
    switch (category) {
      case 'salary':
      case 'income':
        return <DollarSign className="text-green-500" />;
      case 'shopping':
        return <ShoppingBag className="text-purple-600" />;
      case 'coffee':
        return <Coffee className="text-amber-600" />;
      case 'transport':
        return <Car className="text-blue-500" />;
      case 'housing':
      case 'rent':
        return <Home className="text-teal-500" />;
      case 'gifts':
        return <Gift className="text-pink-500" />;
      case 'food':
        return <Utensils className="text-orange-500" />;
      case 'business':
      case 'freelance':
        return <Briefcase className="text-blue-700" />;
      case 'entertainment':
        return <Smartphone className="text-pink-500" />;
      case 'transfer':
        return <ArrowRightLeft className="text-gray-500" />;
      default:
        return <Plus className="text-gray-500" />;
    }
  };
  
  const getCategoryColor = (category: string) => {
    const normalizedCategory = category.toLowerCase();
    
    // For income
    if (normalizedCategory === 'salary' || 
        normalizedCategory === 'income' ||
        normalizedCategory === 'freelance' ||
        normalizedCategory === 'business') {
      return 'bg-green-100 text-green-800';
    }
    
    // For savings
    if (normalizedCategory.startsWith('savings:')) {
      if (normalizedCategory.includes('emergency')) {
        return 'bg-amber-100 text-amber-800';
      }
      if (normalizedCategory.includes('goal')) {
        return 'bg-purple-100 text-purple-800';
      }
      return 'bg-green-100 text-green-800';
    }
    
    // Try to find a matching budget
    const matchingBudget = budgets.find(
      budget => budget.category.toLowerCase() === normalizedCategory
    );
    
    if (matchingBudget) {
      // Use the budget's color if available
      return matchingBudget.color.replace('bg-', 'bg-') + ' ' + 
             matchingBudget.color.replace('bg-', 'text-').replace('-100', '-800');
    }
    
    // Default for expenses
    return 'bg-red-100 text-red-800';
  };

  const viewReceipt = (url: string) => {
    setSelectedReceiptUrl(url);
  };

  const closeReceiptModal = () => {
    setSelectedReceiptUrl(null);
  };

  const budgetCategories = budgets.map(budget => {
    const categoryKey = budget.category.toLowerCase();
    
    return {
      id: budget.id,
      name: budget.category,
      icon: categoryKey,
      color: budget.color
    };
  });

  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const category = transaction.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  return (
    <div>
      <h3 className="font-medium text-lg mb-4">Recent Transactions</h3>
      
      {transactions.length === 0 ? (
        <div className="text-center p-6 bg-muted rounded-lg">
          <p className="text-muted-foreground">No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(groupedTransactions).map(([category, categoryTransactions]) => {
            const isExpense = categoryTransactions[0].amount < 0;
            const isSavings = category.startsWith('savings:');
            const totalAmount = categoryTransactions.reduce(
              (sum, t) => sum + t.amount, 
              0
            );
            
            return (
              <div 
                key={category} 
                className="bg-card dark:bg-gray-800 p-4 rounded-xl shadow-subtle transition-all hover:shadow-md active:scale-[0.98]"
                onClick={() => onCategoryClick && onCategoryClick(category)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className={cn(
                      "p-2 rounded-full",
                      isExpense ? "bg-red-100 dark:bg-red-900/20" : 
                      isSavings ? "bg-green-100 dark:bg-green-900/20" : "bg-blue-100 dark:bg-blue-900/20"
                    )}>
                      {getTransactionIcon(category)}
                    </div>
                    
                    <div>
                      <h4 className="font-medium">
                        {category.startsWith('savings:goal:')
                          ? 'Savings Goal'
                          : category.charAt(0).toUpperCase() + 
                            category.slice(1).replace('savings:', '')}
                      </h4>
                      <div className="flex gap-2 mt-1">
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          getCategoryColor(category)
                        )}>
                          {categoryTransactions.length} Transactions
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* <p className={cn(
                    "font-semibold",
                    isExpense ? "text-finance-expense" : 
                    isSavings ? "text-finance-saving" : "text-finance-income"
                  )}>
                    {totalAmount < 0 ? '-' : '+'}{formatCurrency(Math.abs(totalAmount))}
                  </p> */}
                </div>

                <div className="mt-3 space-y-2">
                  {categoryTransactions.map(transaction => (
                    <div 
                      key={transaction.id} 
                      className="flex items-center justify-between px-3 py-2 bg-background dark:bg-gray-700/50 rounded-lg"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-2">
                        <p className="text-sm">{transaction.description}</p>
                        {transaction.receipt_url && (
                          <button
                            className="p-1 rounded-full hover:bg-muted"
                            onClick={() => viewReceipt(transaction.receipt_url!)}
                          >
                            <FileImage size={14} className="text-muted-foreground" />
                          </button>
                        )}
                      </div>
                      <span className="text-sm font-medium">
                        {transaction.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(transaction.amount))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <Dialog open={selectedReceiptUrl !== null} onOpenChange={closeReceiptModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Receipt Image</DialogTitle>
          </DialogHeader>
          {selectedReceiptUrl && (
            <div className="flex items-center justify-center p-2">
              <img 
                src={selectedReceiptUrl} 
                alt="Receipt" 
                className="max-w-full max-h-[70vh] object-contain rounded-md"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecentTransactions;
