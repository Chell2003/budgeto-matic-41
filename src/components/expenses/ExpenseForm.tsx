import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { getSavingsGoals } from '@/services/financeService';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PiggyBank, Target, Camera, FileImage, X } from 'lucide-react';
import { incomeCategories } from '@/lib/data';
import CategorySelector, { ExpenseCategory } from './CategorySelector';
import AmountInput from '../common/AmountInput';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ExtendedBudget, ExtendedSavingsGoal } from '@/types/extended';

interface ExpenseFormProps {
  categories: ExpenseCategory[];
  onAddExpense: (expense: {
    amount: number;
    description: string;
    category: string;
    date: Date;
    receipt?: File;
  }) => void;
  budgets?: ExtendedBudget[];
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
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [savingsGoals, setSavingsGoals] = useState<ExtendedSavingsGoal[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [transactionType, setTransactionType] = useState<'expense' | 'income' | 'savings'>('expense');
  const [customExpenseCategory, setCustomExpenseCategory] = useState<string>('');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (transactionType === 'savings' && savingsType === 'goal') {
      fetchSavingsGoals();
    }
  }, [transactionType, savingsType]);

  useEffect(() => {
    if (transactionType !== 'expense') {
      setReceipt(null);
      setReceiptPreview(null);
    }
  }, [transactionType]);

  const fetchSavingsGoals = async () => {
    try {
      const goals = await getSavingsGoals();
      const activeGoals = goals.filter(goal => goal.progress < 100);
      setSavingsGoals(activeGoals);
    } catch (error) {
      console.error("Error fetching savings goals:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isMissingRequiredFields = 
      amount === 0 || 
      !description || 
      (transactionType === 'expense' && !selectedCategory && !customExpenseCategory);
    
    if (isMissingRequiredFields) {
      return;
    }
    
    let category = '';
    let finalAmount = amount;
    
    if (transactionType === 'expense') {
      if (selectedCategory) {
        const budgetCategory = budgets.find(b => b.id === selectedCategory);
        category = budgetCategory ? budgetCategory.category.toLowerCase() : '';
      } else if (customExpenseCategory) {
        category = customExpenseCategory.toLowerCase();
      }
      
      finalAmount = -Math.abs(amount);
    } else if (transactionType === 'income') {
      const incomeCategory = incomeCategories.find(cat => cat.id === selectedIncomeCategory);
      category = incomeCategory ? incomeCategory.name.toLowerCase() : 'income';
      finalAmount = Math.abs(amount);
    } else {
      if (savingsType === 'goal' && selectedGoal) {
        category = `savings:goal:${selectedGoal}`;
      } else {
        category = `savings:${savingsType}`;
      }
      finalAmount = Math.abs(amount);
    }
    
    console.log(`Submitting ${transactionType} transaction:`, { 
      amount: finalAmount, 
      description, 
      category, 
      date,
      receipt
    });
    
    onAddExpense({
      amount: finalAmount,
      description,
      category,
      date,
      receipt: receipt || undefined
    });
    
    setAmount(0);
    setDescription('');
    setSelectedCategory(null);
    setSelectedIncomeCategory(null);
    setCustomExpenseCategory('');
    setDate(new Date());
    setReceipt(null);
    setReceiptPreview(null);
    if (transactionType === 'savings') {
      setSavingsType('regular');
      setSelectedGoal(null);
    }
  };

  const resetCategories = () => {
    setSelectedCategory(null);
    setSelectedIncomeCategory(null);
    setCustomExpenseCategory('');
    setSelectedGoal(null);
  };

  const findBudgetForCategory = (categoryId: string) => {
    return budgets.find(b => b.id === categoryId);
  };

  const handleReceiptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setReceipt(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setReceiptPreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCaptureClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveReceipt = () => {
    setReceipt(null);
    setReceiptPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const selectedSavingsGoal = savingsGoals.find(goal => goal.id === selectedGoal);
  const selectedCategoryBudget = transactionType === 'expense' && selectedCategory
    ? findBudgetForCategory(selectedCategory)
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
            <>
              {categories.length > 0 ? (
                <CategorySelector
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={(id) => {
                    setSelectedCategory(id);
                    setCustomExpenseCategory('');
                  }}
                  type="expense"
                />
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2">
                  <p className="text-amber-700 text-sm">No budget categories found</p>
                  <p className="text-amber-600 text-xs mt-1">You can still add expenses with a custom category.</p>
                </div>
              )}
              
              {(!selectedCategory || categories.length === 0) && (
                <div className="space-y-2 mt-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {categories.length > 0 ? 'Or enter custom category' : 'Custom category'}
                  </p>
                  <Input
                    placeholder="Enter category (e.g. Food, Transport)"
                    value={customExpenseCategory}
                    onChange={(e) => {
                      setCustomExpenseCategory(e.target.value);
                      if (e.target.value && selectedCategory) {
                        setSelectedCategory(null);
                      }
                    }}
                  />
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Receipt Image (Optional)
                </p>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleReceiptChange}
                  className="hidden"
                />

                {receiptPreview ? (
                  <div className="relative">
                    <img 
                      src={receiptPreview} 
                      alt="Receipt" 
                      className="w-full h-40 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveReceipt}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCaptureClick}
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      <Camera size={16} />
                      Take Photo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCaptureClick}
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      <FileImage size={16} />
                      Upload Image
                    </Button>
                  </div>
                )}
              </div>
            </>
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
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Savings Type
                </p>
                <Select 
                  value={savingsType} 
                  onValueChange={(value) => {
                    setSavingsType(value as 'regular' | 'emergency' | 'goal');
                    setSelectedGoal(null);
                  }}
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
                        <Target className="mr-2 h-4 w-4 text-purple-500" />
                        <span>Goal-based Savings</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {savingsType === 'goal' && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Select Goal
                  </p>
                  {savingsGoals.length > 0 ? (
                    <Select 
                      value={selectedGoal || ''}
                      onValueChange={setSelectedGoal}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a savings goal" />
                      </SelectTrigger>
                      <SelectContent>
                        {savingsGoals.map(goal => (
                          <SelectItem key={goal.id} value={goal.id}>
                            {goal.name} ({Math.round(goal.progress)}% complete)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-amber-700 text-sm">No active savings goals found</p>
                      <p className="text-amber-600 text-xs mt-1">Create a savings goal first to contribute to it.</p>
                    </div>
                  )}
                </div>
              )}
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
          
          {transactionType === 'savings' && savingsType === 'goal' && selectedGoal && selectedSavingsGoal && (
            <div className="text-xs mt-2 p-2 rounded-md bg-blue-50 text-blue-700">
              {`Contributing to: ${selectedSavingsGoal.name} (${Math.round(selectedSavingsGoal.progress)}% complete)`}
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
              (transactionType === 'expense' && !selectedCategory && !customExpenseCategory) ||
              (transactionType === 'savings' && savingsType === 'goal' && !selectedGoal)
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
