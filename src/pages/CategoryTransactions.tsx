
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/layout/MobileLayout';
import { getTransactions, getBudgets } from '@/services/financeService';
import { Transaction } from '@/components/dashboard/RecentTransactions';
import { ArrowLeft, FileImage, Pencil } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import EditTransactionDialog from '@/components/expenses/EditTransactionDialog';
import { ExpenseCategory } from '@/components/expenses/CategorySelector';

const CategoryTransactions = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const transactionsData = await getTransactions();
      
      // Decode the category from the URL
      const decodedCategory = category ? decodeURIComponent(category) : '';
      
      // Filter transactions by the selected category
      const filtered = transactionsData.filter(t => t.category === decodedCategory);
      setTransactions(filtered);

      // Get categories from budgets
      const budgetsData = await getBudgets();
      const expenseCategories = budgetsData.map(budget => ({
        id: budget.id,
        name: budget.category,
        icon: budget.category.toLowerCase(),
        color: budget.color
      }));
      setCategories(expenseCategories);
    } catch (error) {
      console.error('Error fetching category transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [category]);

  const handleBack = () => {
    navigate('/');
  };

  const viewReceipt = (url: string) => {
    setSelectedReceiptUrl(url);
  };

  const closeReceiptModal = () => {
    setSelectedReceiptUrl(null);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleTransactionUpdated = () => {
    fetchData();
    toast.success("Transaction updated successfully");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const displayCategoryName = (categoryString: string | undefined) => {
    if (!categoryString) return 'Transactions';
    
    return categoryString.charAt(0).toUpperCase() + 
           categoryString.slice(1).replace('savings:', '');
  };

  return (
    <MobileLayout currentPage="dashboard">
      <header className="mb-6">
        <button 
          onClick={handleBack} 
          className="flex items-center gap-1 text-muted-foreground mb-2"
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>
        <h1 className="text-2xl font-bold">{displayCategoryName(category)} Transactions</h1>
      </header>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-3 max-h-full overflow-y-auto py-2">
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No transactions found</p>
          ) : (
            transactions.map(transaction => (
              <div key={transaction.id} className="bg-card dark:bg-gray-800 p-4 rounded-xl shadow-subtle">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{transaction.description}</h4>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className={`font-semibold ${transaction.amount < 0 ? 'text-finance-expense' : 'text-finance-income'}`}>
                      {formatCurrency(transaction.amount)}
                    </p>
                    <button
                      onClick={() => handleEditTransaction(transaction)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>
                  </div>
                </div>
                
                {transaction.receipt_url && (
                  <div className="mt-2">
                    <button 
                      onClick={() => viewReceipt(transaction.receipt_url!)}
                      className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1"
                    >
                      <FileImage size={14} />
                      View Receipt
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Receipt Image Modal */}
      <Dialog open={selectedReceiptUrl !== null} onOpenChange={closeReceiptModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Receipt Image</DialogTitle>
          </DialogHeader>
          {selectedReceiptUrl && (
            <div className="flex items-center justify-center p-2">
              <img 
                src={selectedReceiptUrl} 
                alt="Receipt" 
                className="max-w-full max-h-[70vh] object-contain rounded-md"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Transaction Dialog */}
      <EditTransactionDialog
        isOpen={editingTransaction !== null}
        onClose={() => setEditingTransaction(null)}
        transaction={editingTransaction}
        onTransactionUpdated={handleTransactionUpdated}
        categories={categories}
      />
    </MobileLayout>
  );
};

export default CategoryTransactions;
