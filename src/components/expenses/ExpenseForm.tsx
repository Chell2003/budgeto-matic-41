import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Budget } from '@/services/financeService';
import { getBudgets } from '@/services/financeService';
import { CalendarIcon, PiggyBank } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AmountInput from '../common/AmountInput';
import CategorySelector, { ExpenseCategory } from './CategorySelector';
import { incomeCategories } from '@/lib/data';

interface ExpenseFormProps {
  categories: ExpenseCategory[];
  onAddExpense: (expense: {
    amount: number;
    description: string;
    category: string;
    date: Date;
  }) => void;
  budgets?: Budget[];
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ 
  categories, 
  onAddExpense, 
  budgets = [] 
}) => {
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedIncomeCategory, setSelectedIncomeCategory] = useState<string | null>(null);
  const [savingsType, setSavingsType] = useState<'regular' | 'emergency' | 'goal'>('regular');
  const [date, setDate] = useState<Date>(new Date());
  const [transactionType, setTransactionType] = useState<'expense' | 'income' | 'savings'>('expense');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isMissingRequiredFields = 
      amount === 0 || 
      !description || 
      (transactionType === 'expense' && !selectedCategory) ||
      (transactionType === 'income' && !selectedIncomeCategory);
    
    if (isMissingRequiredFields) {
      return;
    }
    
    let category = '';
    let finalAmount = amount;
    
    if (transactionType === 'expense') {
      const budgetCategory = budgets.find(b => b.id === selectedCategory);
      category = budgetCategory ? budgetCategory.category.toLowerCase() : '';
      finalAmount = -Math.abs(amount);
    } else if (transactionType === 'income') {
      const incomeCategory = incomeCategories.find(cat => cat.id === selectedIncomeCategory);
      category = incomeCategory ? incomeCategory.name.toLowerCase() : 'income';
    } else {
      category = `savings:${savingsType}`;
    }
    
    onAddExpense({
      amount: finalAmount,
      description,
      category,
      date
    });
    
    setAmount(0);
    setDescription('');
    setSelectedCategory(null);
    setSelectedIncomeCategory(null);
    setDate(new Date());
    if (transactionType === 'savings') {
      setSavingsType('regular');
    }
  };
  
  const resetCategories = () => {
    setSelectedCategory(null);
    setSelectedIncomeCategory(null);
  };
  
  const findBudgetForCategory = (category: string) => {
    return budgets.find(b => b.id === category);
  };

  const selectedCategoryBudget = transactionType === 'expense' 
    ? findBudgetForCategory(selectedCategory || '') 
    : null;

  return (
    <Card className="glass animate-scale-in">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Add Transaction</h2>
            
            <Select 
              value={transactionType} 
              onValueChange={(value) => {
                setTransactionType(value as 'expense' | 'income' | 'savings');
                resetCategories();
              }}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense" className="text-finance-expense">Expense</SelectItem>
                <SelectItem value="income" className="text-finance-income">Income</SelectItem>
                <SelectItem value="savings" className="text-finance-saving">Savings</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Amount
            </p>
            <AmountInput 
              value={amount} 
              onChange={setAmount}
              isExpense={transactionType === 'expense'}
              className={cn(
                transactionType === 'income' && "text-finance-income",
                transactionType === 'savings' && "text-finance-saving"
              )}
            />
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Description
            </p>
            <Input
              placeholder={`What was this ${transactionType} for?`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          {transactionType === 'expense' && (
            <CategorySelector
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              type="expense"
            />
          )}
          
          {transactionType === 'income' && (
            <CategorySelector
              categories={incomeCategories}
              selectedCategory={selectedIncomeCategory}
              onSelectCategory={setSelectedIncomeCategory}
              type="income"
            />
          )}

          {transactionType === 'savings' && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Savings Type
              </p>
              <Select 
                value={savingsType} 
                onValueChange={(value) => setSavingsType(value as 'regular' | 'emergency' | 'goal')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select savings type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular" className="flex items-center">
                    <div className="flex items-center">
                      <PiggyBank className="mr-2 h-4 w-4 text-finance-saving" />
                      <span>Regular Savings</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="emergency" className="flex items-center">
                    <div className="flex items-center">
                      <PiggyBank className="mr-2 h-4 w-4 text-amber-500" />
                      <span>Emergency Fund</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="goal" className="flex items-center">
                    <div className="flex items-center">
                      <PiggyBank className="mr-2 h-4 w-4 text-purple-500" />
                      <span>Goal-based Savings</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Date
            </p>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {transactionType === 'expense' && selectedCategory && selectedCategoryBudget && (
            <div className={cn(
              "text-xs mt-2 p-2 rounded-md",
              selectedCategoryBudget.spent + Math.abs(amount) > selectedCategoryBudget.allocated 
                ? "bg-red-50 text-finance-expense" 
                : "bg-green-50 text-green-700"
            )}>
              {selectedCategoryBudget.spent + Math.abs(amount) > selectedCategoryBudget.allocated 
                ? "⚠️ This expense will exceed your budget" 
                : "✅ This expense is within your budget"}
            </div>
          )}
          
          <Button 
            type="submit" 
            className={cn(
              "w-full mt-4",
              transactionType === 'income' && "bg-finance-income hover:bg-finance-income/90",
              transactionType === 'savings' && "bg-finance-saving hover:bg-finance-saving/90"
            )}
            disabled={
              amount === 0 || 
              !description || 
              (transactionType === 'expense' && !selectedCategory) ||
              (transactionType === 'income' && !selectedIncomeCategory)
            }
          >
            Add {transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ExpenseForm;
