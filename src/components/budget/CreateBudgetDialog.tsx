
import React, { useState } from 'react';
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
import AmountInput from '@/components/common/AmountInput';
import { addBudget } from '@/services/financeService';

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
  'Other'
];

const budgetFormSchema = z.object({
  category: z.enum(BUDGET_CATEGORIES as [string, ...string[]], {
    errorMap: () => ({ message: 'Please select a category' })
  }),
  allocated: z.number().min(1, 'Amount must be greater than 0'),
});

type BudgetFormValues = z.infer<typeof budgetFormSchema>;

interface CreateBudgetDialogProps {
  onBudgetCreated: () => void;
}

const CreateBudgetDialog: React.FC<CreateBudgetDialogProps> = ({ onBudgetCreated }) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      category: undefined,
      allocated: 0,
    },
  });

  const handleSubmit = async (data: BudgetFormValues) => {
    try {
      setIsSubmitting(true);
      await addBudget({
        category: data.category,
        allocated: data.allocated,
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
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Create New Budget</DialogTitle>
        </DialogHeader>
        
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
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
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
              name="allocated"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Amount</FormLabel>
                  <FormControl>
                    <AmountInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="0.00"
                      isExpense={false}
                    />
                  </FormControl>
                  <FormMessage />
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
      </DialogContent>
    </Dialog>
  );
};

export default CreateBudgetDialog;
