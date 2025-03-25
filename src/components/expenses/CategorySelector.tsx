
import React from 'react';
import { 
  ShoppingBag, Coffee, Car, Home, Gift, Utensils, 
  Briefcase, Smartphone, Plus, CreditCard, DollarSign,
  Wallet, PiggyBank, ArrowRightLeft, Shield, ShieldCheck,
  UserCheck, Send, HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      <Select
        value={selectedCategory || undefined}
        onValueChange={onSelectCategory}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={`Choose a ${type === 'income' ? 'source' : 'category'}`} />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => {
            const Icon = iconMap[category.icon] || ShoppingBag;
            
            return (
              <SelectItem 
                key={category.id} 
                value={category.id}
                className="flex items-center gap-2"
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center",
                    `bg-${category.color}-100`
                  )}>
                    <Icon size={14} className={`text-${category.color}-600`} />
                  </div>
                  <span>{category.name}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CategorySelector;
