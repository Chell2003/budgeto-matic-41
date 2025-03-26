
import React from 'react';
import { 
  ShoppingBag, Coffee, Car, Home, Gift, 
  Utensils, Briefcase, Smartphone, PiggyBank, ArrowUpRight,
  Wallet, DollarSign, ArrowRightLeft, Shield, ShieldCheck,
  UserCheck, Send, HelpCircle, CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Budget } from '@/services/financeService';

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
  budgets?: Budget[];
}

// Map of category to icon
const categoryIcons: Record<string, React.ElementType> = {
  // Expense categories
  shopping: ShoppingBag,
  food: Utensils,
  coffee: Coffee,
  transport: Car,
  housing: Home,
  gifts: Gift,
  bills: CreditCard,
  
  // Income categories
  salary: Briefcase,
  allowance: Wallet,
  "cash savings": PiggyBank,
  "extra income": DollarSign,
  "fund transfer": ArrowRightLeft,
  "government aid": Shield,
  insurance: ShieldCheck,
  pension: UserCheck,
  remittance: Send,
  others: HelpCircle,
  uncategorized: HelpCircle,
  
  // Special categories
  income: ArrowUpRight,
  "savings:regular": PiggyBank,
  "savings:emergency": PiggyBank,
  "savings:goal": PiggyBank,
  savings: PiggyBank
};

// Map of category to background color
const categoryColors: Record<string, string> = {
  // Expense categories
  shopping: 'bg-purple-100',
  food: 'bg-orange-100',
  coffee: 'bg-amber-100',
  transport: 'bg-blue-100',
  housing: 'bg-teal-100',
  gifts: 'bg-pink-100',
  bills: 'bg-gray-100',
  
  // Income categories
  salary: 'bg-green-100',
  allowance: 'bg-emerald-100',
  "cash savings": 'bg-teal-100',
  "extra income": 'bg-cyan-100',
  "fund transfer": 'bg-sky-100',
  "government aid": 'bg-blue-100',
  insurance: 'bg-indigo-100',
  pension: 'bg-violet-100',
  remittance: 'bg-purple-100',
  others: 'bg-gray-100',
  uncategorized: 'bg-slate-100',
  
  // Special categories
  income: 'bg-finance-income/10',
  "savings:regular": 'bg-finance-saving/10',
  "savings:emergency": 'bg-amber-100',
  "savings:goal": 'bg-purple-100',
  savings: 'bg-finance-saving/10'
};

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions, budgets = [] }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
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

  // Find the related budget for a category
  const findBudgetForCategory = (category: string) => {
    return budgets.find(b => b.category.toLowerCase() === category.toLowerCase());
  };

  // Calculate budget percentage for a transaction
  const getBudgetPercentage = (transaction: Transaction) => {
    if (transaction.amount >= 0) return null; // Only for expenses
    
    const budget = findBudgetForCategory(transaction.category);
    if (!budget) return null;
    
    return Math.round((budget.spent / budget.allocated) * 100);
  };

  // Format savings category for display
  const formatSavingsCategory = (category: string) => {
    if (category.startsWith('savings:')) {
      const type = category.split(':')[1];
      
      switch (type) {
        case 'regular':
          return 'Regular Savings';
        case 'emergency':
          return 'Emergency Fund';
        case 'goal':
          return 'Goal-based Savings';
        default:
          return 'Savings';
      }
    }
    
    return category.charAt(0).toUpperCase() + category.slice(1);
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
            const categoryKey = transaction.category.toLowerCase();
            const Icon = categoryIcons[categoryKey] || ShoppingBag;
            const bgColor = categoryColors[categoryKey] || 'bg-gray-100';
            const isExpense = transaction.amount < 0;
            const isSavings = transaction.category.toLowerCase().includes('savings');
            const budgetPercentage = getBudgetPercentage(transaction);
            const budget = isExpense ? findBudgetForCategory(transaction.category) : null;
            const isOverBudget = budget && budget.spent > budget.allocated;
            
            // Determine category display name
            const categoryDisplay = isSavings 
              ? formatSavingsCategory(transaction.category)
              : transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1);

            return (
              <div
                key={transaction.id}
                className="flex flex-col p-3 rounded-xl bg-white shadow-subtle press-effect"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mr-3", bgColor)}>
                      <Icon size={18} className="text-foreground opacity-75" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(transaction.date)} 
                        {isSavings && <span className="ml-1">• {categoryDisplay}</span>}
                      </p>
                    </div>
                  </div>
                  <p className={cn(
                    "font-medium",
                    isExpense ? "text-finance-expense" : (
                      isSavings ? "text-finance-saving" : "text-finance-income"
                    )
                  )}>
                    {isExpense ? "-" : "+"}{formatCurrency(transaction.amount)}
                  </p>
                </div>
                
                {budget && (
                  <div className="mt-2 pl-13">
                    <p className="text-xs text-muted-foreground">
                      Budget: {formatCurrency(budget.allocated)} 
                      {isOverBudget && (
                        <span className="text-finance-expense ml-1">(Over budget)</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecentTransactions;
