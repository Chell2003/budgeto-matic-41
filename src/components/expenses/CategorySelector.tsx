
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

// Map of icon names to icon components - making this consistent with BudgetList
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
  helpCircle: HelpCircle,
  // Ensure all icons from BudgetList are included here
  shopping: ShoppingBag,
  food: Utensils,
  transport: Car,
  housing: Home,
  utilities: Home,
  entertainment: Smartphone,
  healthcare: Shield,
  education: Briefcase,
  "personal care": UserCheck,
  bills: CreditCard,
  gifts: Gift,
  other: Plus,
  miscellaneous: Plus
};

// Map of category to background color - ensuring consistency with BudgetList
const categoryColors: Record<string, string> = {
  shopping: 'purple',
  food: 'orange',
  coffee: 'amber',
  transport: 'blue',
  housing: 'teal',
  utilities: 'blue',
  entertainment: 'pink',
  healthcare: 'green',
  education: 'indigo',
  "personal care": 'violet',
  bills: 'gray',
  gifts: 'pink',
  other: 'slate',
  miscellaneous: 'slate'
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
            // Use iconMap to find the appropriate icon, defaulting to the category's icon or ShoppingBag
            const Icon = iconMap[category.icon] || iconMap[category.name.toLowerCase()] || ShoppingBag;
            
            // Get the color from categoryColors if available, or use the category's color
            const colorName = categoryColors[category.name.toLowerCase()] || category.color || 'gray';
            
            return (
              <SelectItem 
                key={category.id} 
                value={category.id}
                className="flex items-center gap-2"
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center",
                    `bg-${colorName}-100 dark:bg-${colorName}-900/30`
                  )}>
                    <Icon size={14} className={`text-${colorName}-600 dark:text-${colorName}-400`} />
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
