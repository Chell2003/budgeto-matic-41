
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
  receipt_url?: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  budgets?: Budget[];
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ 
  transactions,
  budgets = []
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

  return (
    <div>
      <h3 className="font-medium text-lg mb-4">Recent Transactions</h3>
      
      {transactions.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <p className="text-muted-foreground">No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map(transaction => {
            const isExpense = transaction.amount < 0;
            const isSavings = transaction.category.startsWith('savings:');
            
            return (
              <div key={transaction.id} className="bg-white p-4 rounded-xl shadow-subtle">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className={cn(
                      "p-2 rounded-full",
                      isExpense ? "bg-red-100" : isSavings ? "bg-green-100" : "bg-blue-100"
                    )}>
                      {getTransactionIcon(transaction.category)}
                    </div>
                    
                    <div>
                      <h4 className="font-medium">{transaction.description}</h4>
                      <div className="flex gap-2 mt-1">
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          getCategoryColor(transaction.category)
                        )}>
                          {transaction.category.startsWith('savings:goal:')
                            ? 'Savings Goal'
                            : transaction.category.charAt(0).toUpperCase() + 
                              transaction.category.slice(1).replace('savings:', '')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(transaction.date), 'MMM d, yyyy')}
                        </span>
                        
                        {transaction.receipt_url && (
                          <button 
                            onClick={() => viewReceipt(transaction.receipt_url!)}
                            className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800"
                          >
                            <FileImage size={12} />
                            Receipt
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <p className={cn(
                    "font-semibold",
                    isExpense ? "text-finance-expense" : 
                    isSavings ? "text-finance-saving" : "text-finance-income"
                  )}>
                    {isExpense ? '-' : '+'}{formatCurrency(Math.abs(transaction.amount))}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Receipt Image Modal */}
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
