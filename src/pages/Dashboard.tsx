
import React, { useState, useEffect } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import FinanceSummary from '@/components/dashboard/FinanceSummary';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import { getTransactions, getFinancialSummary } from '@/services/financeService';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Transaction } from '@/components/dashboard/RecentTransactions';
import { X } from 'lucide-react';

const Dashboard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [summary, setSummary] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
    savings: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);

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

  const handleCategoryClick = (category: string) => {
    // Filter transactions by the selected category
    const filtered = transactions.filter(t => t.category === category);
    setFilteredTransactions(filtered);
    setSelectedCategory(category);
    setShowCategoryDialog(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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
            <RecentTransactions 
              transactions={transactions.slice(0, 5)} 
              onCategoryClick={handleCategoryClick} 
            />
          </div>
        </>
      )}

      {/* Category transactions dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                {selectedCategory && selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1).replace('savings:', '')} Transactions
              </span>
              <button 
                onClick={() => setShowCategoryDialog(false)}
                className="rounded-full p-1 hover:bg-muted"
              >
                <X size={18} />
              </button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3 max-h-[60vh] overflow-y-auto py-2">
            {filteredTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No transactions found</p>
            ) : (
              filteredTransactions.map(transaction => (
                <div key={transaction.id} className="bg-white p-4 rounded-xl shadow-subtle">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{transaction.description}</h4>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <p className={`font-semibold ${transaction.amount < 0 ? 'text-finance-expense' : 'text-finance-income'}`}>
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                  
                  {transaction.receipt_url && (
                    <div className="mt-2">
                      <a 
                        href={transaction.receipt_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 flex items-center gap-1"
                      >
                        View Receipt
                      </a>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
};

export default Dashboard;
