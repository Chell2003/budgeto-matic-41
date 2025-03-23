
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (amount === 0 || !description || !selectedCategory) {
      return;
    }
    
    onAddExpense({
      amount,
      description,
      category: selectedCategory,
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
          <h2 className="text-xl font-semibold mb-4">Add Expense</h2>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Amount
            </p>
            <AmountInput 
              value={amount} 
              onChange={setAmount}
              isExpense={true}
            />
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Description
            </p>
            <Input
              placeholder="What was this expense for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <CategorySelector
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
          
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
              <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <Button 
            type="submit" 
            className="w-full mt-4"
            disabled={amount === 0 || !description || !selectedCategory}
          >
            Add Expense
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ExpenseForm;
