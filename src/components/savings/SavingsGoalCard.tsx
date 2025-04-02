
import React from 'react';
import { cn } from '@/lib/utils';
import { SavingsGoal } from '@/services/financeService';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PiggyBank, Calendar, Target } from 'lucide-react';
import { format } from 'date-fns';
import { addTransaction } from '@/services/financeService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  onUpdate: () => void;
}

const SavingsGoalCard: React.FC<SavingsGoalCardProps> = ({ goal, onUpdate }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const handleAddContribution = async () => {
    try {
      // Use the ID as part of the category to track which goal receives the contribution
      await addTransaction({
        amount: Math.min(goal.remaining_amount, 1000), // Default contribution of 1000 or remaining amount
        description: `Contribution to ${goal.name}`,
        category: `savings:goal:${goal.id}`,
        date: new Date()
      });
      
      toast.success('Contribution added successfully');
      onUpdate();
    } catch (error) {
      console.error('Error adding contribution:', error);
      toast.error('Failed to add contribution');
    }
  };

  const targetDate = new Date(goal.target_date);
  const timeText = goal.frequency === 'weekly'
    ? `${goal.time_remaining.weeks} weeks left`
    : goal.frequency === 'monthly'
      ? `${goal.time_remaining.months} months left`
      : `${goal.time_remaining.days} days left`;
  
  return (
    <Card className="glass animate-scale-in">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{goal.name}</h3>
          <span className={cn(
            "text-xs px-2 py-1 rounded-full",
            goal.frequency === 'weekly' ? "bg-amber-100 text-amber-800" :
            goal.frequency === 'monthly' ? "bg-blue-100 text-blue-800" :
            "bg-gray-100 text-gray-800"
          )}>
            {goal.frequency === 'weekly' ? 'Weekly' : 
             goal.frequency === 'monthly' ? 'Monthly' : 'No Schedule'}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className="text-sm font-medium">{Math.round(goal.progress)}%</span>
            </div>
            <Progress 
              value={goal.progress} 
              className="h-2"
              // Green when completed, otherwise finance-saving color
              style={{
                backgroundColor: 'rgba(0,0,0,0.1)',
                '--tw-bg-opacity': 1,
                backgroundColor: goal.progress >= 100 ? 'rgb(34 197 94 / var(--tw-bg-opacity))' : undefined
              }}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <PiggyBank size={16} className="text-finance-saving" />
              <span className="text-muted-foreground">Saved</span>
            </div>
            <div className="text-right font-medium">
              {formatCurrency(goal.current_amount)}
            </div>
            
            <div className="flex items-center gap-2">
              <Target size={16} className="text-finance-expense" />
              <span className="text-muted-foreground">Target</span>
            </div>
            <div className="text-right font-medium">
              {formatCurrency(goal.target_amount)}
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-500" />
              <span className="text-muted-foreground">Due</span>
            </div>
            <div className="text-right font-medium">
              {format(targetDate, 'MMM d, yyyy')}
            </div>
          </div>
          
          <div className="pt-2 pb-1">
            {goal.progress < 100 ? (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {formatCurrency(goal.remaining_amount)} more needed • {timeText}
                </span>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleAddContribution}
                  className="text-xs h-8 border-finance-saving text-finance-saving hover:bg-finance-saving/10">
                  Add Funds
                </Button>
              </div>
            ) : (
              <div className="text-xs text-green-600 font-medium">
                Goal completed! 🎉
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SavingsGoalCard;
