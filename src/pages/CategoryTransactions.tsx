
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/layout/MobileLayout';
import { getTransactions } from '@/services/financeService';
import { Transaction } from '@/components/dashboard/RecentTransactions';
import { ArrowLeft, FileImage } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';

const CategoryTransactions = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const transactionsData = await getTransactions();
        
        // Decode the category from the URL
        const decodedCategory = category ? decodeURIComponent(category) : '';
        
        // Filter transactions by the selected category
        const filtered = transactionsData.filter(t => t.category === decodedCategory);
        setTransactions(filtered);
      } catch (error) {
        console.error('Error fetching category transactions:', error);
        toast.error('Failed to load transactions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
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
              <div key={transaction.id} className="bg-card p-4 rounded-xl shadow-subtle">
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
                  <p className={`font-semibold ${transaction.amount < 0 ? 'text-finance-expense' : 'text-finance-income'}`}>
                    {formatCurrency(transaction.amount)}
                  </p>
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
    </MobileLayout>
  );
};

export default CategoryTransactions;

