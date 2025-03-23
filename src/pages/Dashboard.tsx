
import React, { useState } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import FinanceSummary from '@/components/dashboard/FinanceSummary';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import { financialSummary, transactions as initialTransactions } from '@/lib/data';

const Dashboard = () => {
  const [transactions, setTransactions] = useState(initialTransactions);

  return (
    <MobileLayout currentPage="dashboard">
      <header className="mb-6">
        <p className="text-muted-foreground">Hello,</p>
        <h1 className="text-2xl font-bold">Welcome Back</h1>
      </header>

      <FinanceSummary 
        balance={financialSummary.balance}
        income={financialSummary.income}
        expenses={financialSummary.expenses}
        savings={financialSummary.savings}
      />

      <div className="mt-8">
        <RecentTransactions transactions={transactions.slice(0, 5)} />
      </div>
    </MobileLayout>
  );
};

export default Dashboard;
