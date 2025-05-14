
import React, { useState, useEffect } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { getSavingsGoals } from '@/services/financeService';
import CreateSavingsGoalDialog from '@/components/savings/CreateSavingsGoalDialog';
import SavingsGoalCard from '@/components/savings/SavingsGoalCard';
import { PiggyBank } from 'lucide-react';
import { ExtendedSavingsGoal } from '@/types/extended';

const SavingsGoals = () => {
  const [goals, setGoals] = useState<ExtendedSavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      const data = await getSavingsGoals();
      setGoals(data);
    } catch (error) {
      console.error('Error fetching savings goals:', error);
      toast.error('Failed to load savings goals');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  return (
    <MobileLayout currentPage="expenses">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Savings Goals</h1>
        <p className="text-muted-foreground mt-1">Track and manage your savings goals</p>
      </header>

      <div className="mb-6">
        <CreateSavingsGoalDialog onGoalCreated={fetchGoals} />
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : goals.length > 0 ? (
        <div className="space-y-4">
          {goals.map((goal) => (
            <SavingsGoalCard 
              key={goal.id} 
              goal={goal} 
              onUpdate={fetchGoals} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed rounded-xl">
          <div className="flex justify-center mb-3">
            <PiggyBank size={48} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-600">No savings goals yet</h3>
          <p className="text-muted-foreground mt-1">Create a goal to start tracking your progress</p>
        </div>
      )}
    </MobileLayout>
  );
};

export default SavingsGoals;
