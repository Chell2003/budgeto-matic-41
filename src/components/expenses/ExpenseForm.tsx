
import React, { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import AmountInput from '../common/AmountInput';
import CategorySelector, { ExpenseCategory } from './CategorySelector';

interface ExpenseFormProps {
  categories: ExpenseCategory[];
  onAddExpense: (expense: {
    amount: number;
    description: string;
    category: string;
    date: Date;
  }) => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ categories, onAddExpense }) => {
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [transactionType, setTransactionType] = useState<'expense' | 'income' | 'savings'>('expense');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (amount === 0 || !description || (transactionType === 'expense' && !selectedCategory)) {
      return;
    }
    
    // For income and savings, we directly use predefined categories
    const category = transactionType === 'expense' 
      ? selectedCategory!
      : transactionType === 'income' 
        ? 'income' 
        : 'savings';
    
    // For income and savings, amount should be positive
    const finalAmount = transactionType === 'expense' 
      ? -Math.abs(amount) 
      : Math.abs(amount);
    
    onAddExpense({
      amount: finalAmount,
      description,
      category,
      date,
    });
    
    // Reset form
    setAmount(0);
    setDescription('');
    setSelectedCategory(null);
    setDate(new Date());
  };
  
  return (
    <Card className="glass animate-scale-in">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Add Transaction</h2>
            
            <Select 
              value={transactionType} 
              onValueChange={(value) => setTransactionType(value as 'expense' | 'income' | 'savings')}
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
            />
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
          
          <Button 
            type="submit" 
            className={cn(
              "w-full mt-4",
              transactionType === 'income' && "bg-finance-income hover:bg-finance-income/90",
              transactionType === 'savings' && "bg-finance-saving hover:bg-finance-saving/90"
            )}
            disabled={amount === 0 || !description || (transactionType === 'expense' && !selectedCategory)}
          >
            Add {transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ExpenseForm;
