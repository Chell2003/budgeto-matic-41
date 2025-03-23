
import React, { useState, useEffect } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import InsightCard, { InsightType } from '@/components/insights/InsightCard';
import { getTransactions, getFinancialSummary } from '@/services/financeService'; 
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

const Insights = () => {
  const [insights, setInsights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const generateInsights = async () => {
      try {
        setIsLoading(true);
        
        // Fetch data to generate insights
        const [transactions, financialSummary] = await Promise.all([
          getTransactions(),
          getFinancialSummary()
        ]);
        
        // Generate insights based on transactions and financial summary
        const generatedInsights = [];
        
        // If we have positive savings
        if (financialSummary.savings > 0) {
          generatedInsights.push({
            title: 'Increased Savings',
            description: `You've saved ${new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(financialSummary.savings)} this month.`,
            type: 'savings' as InsightType,
            changePercentage: 15,
            actionLabel: 'View savings',
          });
        }
        
        // Spending tip
        generatedInsights.push({
          title: 'Spending Tip',
          description: 'Set up automatic transfers to your savings account on payday.',
          type: 'tip' as InsightType,
          actionLabel: 'Learn more',
        });
        
        // Check if income is present
        if (financialSummary.income > 0) {
          generatedInsights.push({
            title: 'Income Recorded',
            description: `Your total income this month is ${new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(financialSummary.income)}.`,
            type: 'income' as InsightType,
            changePercentage: 5,
            actionLabel: 'View income',
          });
        }
        
        // Add expense insight if we have transactions
        if (transactions.length > 0) {
          // Find the largest expense category
          const expenseCategories: Record<string, number> = {};
          
          transactions.forEach(transaction => {
            if (transaction.amount < 0) {
              const category = transaction.category;
              expenseCategories[category] = (expenseCategories[category] || 0) + Math.abs(transaction.amount);
            }
          });
          
          if (Object.keys(expenseCategories).length > 0) {
            const largestCategory = Object.entries(expenseCategories)
              .sort(([, a], [, b]) => b - a)[0];
            
            generatedInsights.push({
              title: `${largestCategory[0]} Spending`,
              description: `Your highest expense category is ${largestCategory[0]} at ${new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(largestCategory[1])}.`,
              type: 'spending' as InsightType,
              changePercentage: -8,
              actionLabel: 'See details',
            });
          }
        }
        
        setInsights(generatedInsights.length > 0 ? generatedInsights : [
          {
            title: 'Add Transactions',
            description: 'Start tracking your expenses to see personalized insights here.',
            type: 'tip' as InsightType,
            actionLabel: 'Add expense',
          }
        ]);
      } catch (error) {
        console.error('Error generating insights:', error);
        toast.error('Failed to load insights');
        setInsights([
          {
            title: 'Welcome to Insights',
            description: 'This is where you'll find personalized financial insights once you start tracking transactions.',
            type: 'tip' as InsightType,
            actionLabel: 'Get started',
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      generateInsights();
    }
  }, [user]);

  return (
    <MobileLayout currentPage="insights">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Insights</h1>
        <p className="text-muted-foreground mt-1">Financial analysis and tips</p>
      </header>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {insights.map((insight, index) => (
            <InsightCard
              key={index}
              title={insight.title}
              description={insight.description}
              type={insight.type}
              changePercentage={insight.changePercentage}
              actionLabel={insight.actionLabel}
            />
          ))}
        </div>
      )}
    </MobileLayout>
  );
};

export default Insights;
