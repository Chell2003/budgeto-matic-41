import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Form,
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addBudget, getFinancialSummary } from '@/services/financeService';
import BudgetCalculator from './BudgetCalculator';
import { supabase } from '@/integrations/supabase/client';

// Predefined budget categories - aligned with expense categories
const BUDGET_CATEGORIES = [
  'Food', 
  'Transport', 
  'Housing', 
  'Utilities', 
  'Entertainment', 
  'Shopping', 
  'Healthcare', 
  'Education', 
  'Personal Care', 
  'Bills',
  'Gifts',
  'Coffee',
  'Savings',
  'Other'
];

const budgetFormSchema = z.object({
  category: z.enum(BUDGET_CATEGORIES as [string, ...string[]], {
    errorMap: () => ({ message: 'Please select a category' })
  }),
  percentage: z.number().min(0.1, 'Percentage must be greater than 0').max(100, 'Percentage cannot exceed 100%'),
  allocated: z.number().min(0, 'Amount must be at least 0'),
});

type BudgetFormValues = z.infer<typeof budgetFormSchema>;

interface CreateBudgetDialogProps {
  onBudgetCreated: () => void;
}

const CreateBudgetDialog: React.FC<CreateBudgetDialogProps> = ({ onBudgetCreated }) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [income, setIncome] = useState(0);
  const [remainingPercentage, setRemainingPercentage] = useState(100);
  const [totalBudgeted, setTotalBudgeted] = useState(0);

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      category: undefined,
      percentage: 0,
      allocated: 0,
    },
  });

  useEffect(() => {
    async function fetchFinancialData() {
      try {
        const summary = await getFinancialSummary();
        setIncome(summary.income);
        
        // Update total budgeted and remaining percentage
        const { data: budgets } = await supabase
          .from('budgets')
          .select('percentage');
        
        if (budgets) {
          const totalPercentage = budgets.reduce((sum, budget) => sum + (budget.percentage || 0), 0);
          setRemainingPercentage(100 - totalPercentage);
          setTotalBudgeted(summary.income * (totalPercentage / 100));
        }
      } catch (error) {
        console.error('Error fetching financial data:', error);
      }
    }
    
    if (open) {
      fetchFinancialData();
    }
  }, [open]);

  const updateAllocatedAmount = (percentage: number) => {
    const amount = (percentage / 100) * income;
    form.setValue('allocated', amount);
  };

  const updatePercentage = (amount: number) => {
    if (income > 0) {
      const percentage = (amount / income) * 100;
      form.setValue('percentage', percentage);
    }
  };

  const handleSubmit = async (data: BudgetFormValues) => {
    if (data.percentage > remainingPercentage) {
      toast.error(`You can only allocate up to ${remainingPercentage.toFixed(1)}% more of your income`);
      return;
    }
    
    try {
      setIsSubmitting(true);
      await addBudget({
        category: data.category,
        allocated: data.allocated,
        percentage: data.percentage
      });
      
      toast.success('Budget created successfully');
      form.reset();
      setOpen(false);
      onBudgetCreated();
    } catch (error) {
      console.error('Error creating budget:', error);
      toast.error('Failed to create budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" variant="outline">
          + Add Budget Category
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] dark:border-border dark:bg-card">
        <DialogHeader>
          <DialogTitle>Create New Budget</DialogTitle>
        </DialogHeader>
        
        {income <= 0 ? (
          <div className="text-center p-4">
            <p className="text-muted-foreground mb-4">Please set your income first before creating a budget.</p>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <SelectTrigger className="bg-white dark:bg-background">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-background dark:border-border">
                          {BUDGET_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Percentage of Income ({remainingPercentage.toFixed(1)}% remaining)</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          placeholder="0"
                          className="text-right"
                          max={remainingPercentage}
                          value={field.value}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            field.onChange(value);
                            updateAllocatedAmount(value);
                          }}
                        />
                        <span className="text-lg">%</span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="allocated"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={field.value}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            field.onChange(value);
                            updatePercentage(value);
                          }}
                        />
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                          ₱
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground mt-1">
                      If monthly income changes, this amount will adjust while keeping the percentage fixed.
                    </p>
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2 pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Budget'}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateBudgetDialog;
