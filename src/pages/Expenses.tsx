import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/layout/MobileLayout';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import { getTransactions, addTransaction, getBudgets } from '@/services/financeService';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ExtendedBudget } from '@/types/extended';
import { ExpenseCategory } from '@/components/expenses/CategorySelector';
import { PiggyBank } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Expenses = () => {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState<ExtendedBudget[]>([]);
  const [budgetCategories, setBudgetCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBudgetLoading, setIsBudgetLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const data = await getTransactions();
        setTransactions(data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        toast({
          title: "Error",
          description: 'Failed to load transactions',
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchBudgets = async () => {
      try {
        setIsBudgetLoading(true);
        const budgetData = await getBudgets();
        setBudgets(budgetData);
        
        const categories = budgetData.map(budget => {
          const categoryKey = budget.category.toLowerCase();
          
          return {
            id: budget.id,
            name: budget.category,
            icon: categoryKey,
            color: budget.color
          };
        });
        
        console.log('Mapped expense categories:', categories);
        setBudgetCategories(categories);
      } catch (error) {
        console.error('Error fetching budgets:', error);
        toast({
          title: "Error",
          description: 'Failed to load budget data',
          variant: "destructive",
        });
      } finally {
        setIsBudgetLoading(false);
      }
    };

    if (user) {
      fetchTransactions();
      fetchBudgets();
    }
  }, [user]);

  const handleAddTransaction = async (transaction: {
    amount: number;
    description: string;
    category: string;
    date: Date;
    receipt?: File;
  }) => {
    try {
      console.log('Transaction Details:', {
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category,
        date: transaction.date,
        hasReceipt: !!transaction.receipt
      });
  
      console.log('Current Budgets BEFORE Transaction:', budgets);
  
      await addTransaction(transaction);
      
      const updatedTransactions = await getTransactions();
      const updatedBudgets = await getBudgets();
  
      console.log('Updated Budgets AFTER Transaction:', updatedBudgets);
  
      const matchingBudget = updatedBudgets.find(
        budget => budget.category.toLowerCase() === transaction.category.toLowerCase()
      );
      
      console.log('Matching Budget:', matchingBudget);
      console.log('Budget Spent Amount:', matchingBudget?.spent);
      console.log('Budget Allocated Amount:', matchingBudget?.allocated);
  
      setTransactions(updatedTransactions);
      setBudgets(updatedBudgets);
      
      let transactionType = 'Expense';
      if (transaction.category.startsWith('savings:')) {
        transactionType = 'Savings';
      } else if (transaction.amount > 0) {
        transactionType = 'Income';
      }
      
      toast({
        title: "Success",
        description: `${transactionType} added successfully`,
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Error",
        description: 'Failed to add transaction',
        variant: "destructive",
      });
    }
  };

  const handleTransactionUpdated = async () => {
    try {
      const updatedTransactions = await getTransactions();
      const updatedBudgets = await getBudgets();
      
      setTransactions(updatedTransactions);
      setBudgets(updatedBudgets);
      
      toast({
        title: "Success",
        description: 'Transaction updated successfully',
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const findBudgetForCategory = (category: string) => {
    return budgets.find(b => b.category.toLowerCase() === category.toLowerCase());
  };

  const handleCategoryClick = (category: string) => {
    navigate(`/category/${encodeURIComponent(category)}`);
  };

  // Calculate total budget and total spent
  const totalBudget = budgets.reduce((sum, category) => sum + category.allocated, 0);
  const totalSpent = budgets.reduce((sum, category) => sum + category.spent, 0);

  return (
    <MobileLayout currentPage="expenses">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-muted-foreground mt-1">Track your income, expenses and savings</p>
      </header>

      <div className="mb-4">
        <Link to="/savings-goals">
          <Button className="w-full flex items-center gap-2 bg-finance-saving hover:bg-finance-saving/90">
            <PiggyBank size={18} />
            <span>View Savings Goals</span>
          </Button>
        </Link>
      </div>

      {isBudgetLoading ? (
        <div className="flex justify-center p-6">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : (
        <ExpenseForm 
          categories={budgetCategories}
          onAddExpense={handleAddTransaction}
          budgets={budgets}
        />
      )}

      {!isBudgetLoading && budgets.length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-medium">Monthly Budget Overview</h2>
          <div className="space-y-3">
            {budgets.map((budget) => {
              const percentUsed = Math.round((budget.spent / budget.allocated) * 100);
              const isOverBudget = percentUsed > 100;
              
              return (
                <div key={budget.id} className="bg-white p-4 rounded-xl shadow-subtle">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-medium">{budget.category}</h4>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.allocated)}
                      </p>
                      <p className={cn(
                        "text-xs font-medium",
                        isOverBudget ? "text-finance-expense" : "text-muted-foreground"
                      )}>
                        {isOverBudget ? 'Over budget' : `${percentUsed}% used`}
                      </p>
                    </div>
                  </div>
                  
                  <Progress 
                    value={Math.min(percentUsed, 100)} 
                    className={cn(
                      "h-2 mt-2",
                      isOverBudget ? "bg-red-100" : "bg-gray-100",
                      isOverBudget && "[&>div]:bg-finance-expense"
                    )}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-8">
        {isLoading ? (
          <div className="flex justify-center p-6">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : (
          <RecentTransactions 
            transactions={transactions} 
            budgets={budgets}
            onTransactionUpdated={handleTransactionUpdated}
            onCategoryClick={handleCategoryClick}
          />
        )}
      </div>
    </MobileLayout>
  );
};

export default Expenses;
