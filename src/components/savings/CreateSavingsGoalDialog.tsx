
import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Form,
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import AmountInput from '@/components/common/AmountInput';
import { addSavingsGoal } from '@/services/financeService';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, HelpCircle } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { format, addMonths } from 'date-fns';
import { cn } from '@/lib/utils';

const savingsGoalFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  target_amount: z.number().min(1, 'Target amount must be greater than 0'),
  current_amount: z.number().min(0, 'Current amount must be 0 or greater').optional(),
  target_date: z.date().min(new Date(), 'Target date must be in the future'),
  frequency: z.enum(['weekly', 'monthly', 'none'], {
    required_error: 'Please select a frequency',
  }),
  target_contribution: z.number().min(0, 'Contribution amount must be 0 or greater'),
});

type SavingsGoalFormValues = z.infer<typeof savingsGoalFormSchema>;

interface CreateSavingsGoalDialogProps {
  onGoalCreated: () => void;
}

const CreateSavingsGoalDialog: React.FC<CreateSavingsGoalDialogProps> = ({ onGoalCreated }) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SavingsGoalFormValues>({
    resolver: zodResolver(savingsGoalFormSchema),
    defaultValues: {
      name: '',
      target_amount: 0,
      current_amount: 0,
      target_date: addMonths(new Date(), 3), // Default to 3 months from now
      frequency: 'monthly',
      target_contribution: 0,
    },
  });

  // Watch the frequency and target_amount to calculate suggested contribution
  const frequency = form.watch('frequency');
  const targetAmount = form.watch('target_amount');
  const currentAmount = form.watch('current_amount') || 0;
  const targetDate = form.watch('target_date');
  
  // Calculate a suggested contribution amount
  const calculateSuggestedContribution = () => {
    if (!targetDate || !targetAmount || targetAmount <= 0) return 0;
    
    const now = new Date();
    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 0;
    
    const remainingAmount = targetAmount - currentAmount;
    
    if (frequency === 'weekly') {
      const weeks = Math.ceil(diffDays / 7);
      return Math.ceil(remainingAmount / weeks);
    } else if (frequency === 'monthly') {
      const months = Math.ceil(diffDays / 30);
      return Math.ceil(remainingAmount / months);
    }
    
    return 0;
  };
  
  // Update the target_contribution field when relevant fields change
  React.useEffect(() => {
    if (frequency !== 'none') {
      const suggestedAmount = calculateSuggestedContribution();
      form.setValue('target_contribution', suggestedAmount);
    }
  }, [frequency, targetAmount, currentAmount, targetDate, form]);

  const handleSubmit = async (data: SavingsGoalFormValues) => {
    try {
      setIsSubmitting(true);
      await addSavingsGoal({
        name: data.name,
        target_amount: data.target_amount,
        current_amount: data.current_amount || 0,
        target_date: data.target_date,
        frequency: data.frequency,
        target_contribution: data.target_contribution || 0,
      });
      
      toast.success('Savings goal created successfully');
      form.reset();
      setOpen(false);
      onGoalCreated();
    } catch (error) {
      console.error('Error creating savings goal:', error);
      toast.error('Failed to create savings goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          + Create New Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Create Savings Goal</DialogTitle>
          <DialogDescription>
            Set up a new savings goal with regular contributions
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Name</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g. New Phone, Vacation, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="target_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Amount</FormLabel>
                  <FormControl>
                    <AmountInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="0.00"
                      isExpense={false}
                      className="text-finance-saving"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="current_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Starting Amount (Optional)</FormLabel>
                  <FormControl>
                    <AmountInput
                      value={field.value || 0}
                      onChange={field.onChange}
                      placeholder="0.00"
                      isExpense={false}
                      className="text-finance-saving"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="target_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Target Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contribution Frequency</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="none">No Schedule</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {frequency !== 'none' && (
              <FormField
                control={form.control}
                name="target_contribution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <span>Planned Contribution</span>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-4 w-4 ml-1">
                            <HelpCircle className="h-3 w-3" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <p className="text-sm">
                            This is the amount you plan to save {frequency === 'weekly' ? 'each week' : 'each month'}.
                            We've calculated a suggested amount based on your goal and timeline.
                          </p>
                        </PopoverContent>
                      </Popover>
                    </FormLabel>
                    <FormControl>
                      <AmountInput
                        value={field.value || 0}
                        onChange={field.onChange}
                        placeholder="0.00"
                        isExpense={false}
                        className="text-finance-saving"
                      />
                    </FormControl>
                    <FormDescription>
                      Suggested: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(calculateSuggestedContribution())}
                      {frequency === 'weekly' ? '/week' : '/month'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <div className="flex justify-end space-x-2 pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting} className="bg-finance-saving hover:bg-finance-saving/90">
                {isSubmitting ? 'Creating...' : 'Create Goal'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSavingsGoalDialog;
