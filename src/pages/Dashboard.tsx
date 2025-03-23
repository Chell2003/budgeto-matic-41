
import React, { useState, useEffect } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import FinanceSummary from '@/components/dashboard/FinanceSummary';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import { getTransactions, getFinancialSummary } from '@/services/financeService';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
    savings: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const [transactionsData, summaryData] = await Promise.all([
          getTransactions(),
          getFinancialSummary()
        ]);
        
        setTransactions(transactionsData);
        setSummary(summaryData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  return (
    <MobileLayout currentPage="dashboard">
      <header className="mb-6">
        <p className="text-muted-foreground">Hello,</p>
        <h1 className="text-2xl font-bold">Welcome Back</h1>
      </header>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <FinanceSummary 
            balance={summary.balance}
            income={summary.income}
            expenses={summary.expenses}
            savings={summary.savings}
          />

          <div className="mt-8">
            <RecentTransactions transactions={transactions.slice(0, 5)} />
          </div>
        </>
      )}
    </MobileLayout>
  );
};

export default Dashboard;
