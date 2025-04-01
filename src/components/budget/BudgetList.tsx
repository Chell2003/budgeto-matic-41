
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Budget } from '@/services/financeService';
import CreateBudgetDialog from './CreateBudgetDialog';
import { 
  ShoppingBag, Coffee, Car, Home, Gift, Utensils, 
  Briefcase, Smartphone, Plus, CreditCard, DollarSign,
  Wallet, PiggyBank, ArrowRightLeft, Shield, ShieldCheck,
  UserCheck, Send, HelpCircle
} from 'lucide-react';

interface BudgetListProps {
  budgetCategories: Budget[];
  onSelectCategory?: (categoryId: string) => void;
  onBudgetCreated?: () => void;
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
  other: Plus,
};

// Map of category to background color
const categoryColors: Record<string, string> = {
  shopping: 'bg-purple-100',
  food: 'bg-orange-100',
  coffee: 'bg-amber-100',
  transport: 'bg-blue-100',
  housing: 'bg-teal-100',
  gifts: 'bg-pink-100',
  bills: 'bg-gray-100',
  other: 'bg-slate-100',
};

const BudgetList: React.FC<BudgetListProps> = ({ 
  budgetCategories,
  onSelectCategory,
  onBudgetCreated = () => {}
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {budgetCategories.map((category) => {
        const percentUsed = Math.round((category.spent / category.allocated) * 100);
        const isOverBudget = percentUsed > 100;
        
        const categoryKey = category.category.toLowerCase();
        const Icon = categoryIcons[categoryKey] || Plus;
        const bgColor = categoryColors[categoryKey] || 'bg-gray-100';
        
        return (
          <div 
            key={category.id}
            className="bg-white p-4 rounded-xl shadow-subtle press-effect"
            onClick={() => onSelectCategory && onSelectCategory(category.id)}
          >
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center mr-3", bgColor)}>
                  <Icon size={16} className="text-foreground opacity-75" />
                </div>
                <h4 className="font-medium">{category.category}</h4>
              </div>
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
                isOverBudget ? "bg-red-100" : "bg-gray-100",
                isOverBudget && "[&>div]:bg-finance-expense"
              )}
            />
          </div>
        );
      })}
      
      <CreateBudgetDialog onBudgetCreated={onBudgetCreated} />
    </div>
  );
};

export default BudgetList;
