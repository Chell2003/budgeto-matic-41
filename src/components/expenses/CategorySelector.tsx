
import React from 'react';
import { 
  ShoppingBag, Coffee, Car, Home, Gift, Utensils, 
  Briefcase, Smartphone, Plus, CreditCard, DollarSign,
  Wallet, PiggyBank, ArrowRightLeft, Shield, ShieldCheck,
  UserCheck, Send, HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ExpenseCategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

interface CategorySelectorProps {
  categories: ExpenseCategory[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string) => void;
  type?: 'expense' | 'income' | 'savings';
}

// Map of icon names to icon components
const iconMap: Record<string, React.ElementType> = {
  shoppingBag: ShoppingBag,
  coffee: Coffee,
  car: Car,
  home: Home,
  gift: Gift,
  utensils: Utensils,
  briefcase: Briefcase,
  smartphone: Smartphone,
  creditCard: CreditCard,
  plus: Plus,
  dollarSign: DollarSign,
  wallet: Wallet,
  piggyBank: PiggyBank,
  arrowRightLeft: ArrowRightLeft,
  shield: Shield,
  shieldCheck: ShieldCheck,
  userCheck: UserCheck,
  send: Send,
  helpCircle: HelpCircle
};

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  type = 'expense'
}) => {
  return (
    <div className="mb-6">
      <p className="text-sm font-medium mb-3 text-muted-foreground">
        Select {type === 'income' ? 'Income Source' : 'Category'}
      </p>
      <div className="grid grid-cols-4 gap-3">
        {categories.map((category) => {
          const Icon = iconMap[category.icon] || ShoppingBag;
          const isSelected = selectedCategory === category.id;
          
          return (
            <button
              key={category.id}
              className={cn(
                "flex flex-col items-center rounded-xl p-3 transition-all duration-200 press-effect",
                isSelected 
                  ? `bg-${category.color}-100 ring-2 ring-${category.color}-500/20` 
                  : "bg-white shadow-subtle hover:bg-gray-50"
              )}
              type="button" // Explicitly set type to button to prevent form submission
              onClick={(e) => {
                e.preventDefault(); // Prevent any form submission
                onSelectCategory(category.id);
              }}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center mb-1",
                `bg-${category.color}-100`
              )}>
                <Icon size={18} className={`text-${category.color}-600`} />
              </div>
              <span className="text-xs font-medium mt-1 text-center">
                {category.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySelector;
