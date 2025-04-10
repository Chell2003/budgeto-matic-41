
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { updateTransaction } from "@/services/financeService";
import { Transaction } from "@/components/dashboard/RecentTransactions";
import AmountInput from '@/components/common/AmountInput';

interface EditTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onTransactionUpdated: () => void;
}

const EditTransactionDialog: React.FC<EditTransactionDialogProps> = ({
  isOpen,
  onClose,
  transaction,
  onTransactionUpdated,
}) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (transaction) {
      setDescription(transaction.description);
      setAmount(Math.abs(transaction.amount));
    }
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transaction) return;
    
    try {
      setIsSubmitting(true);
      
      // Determine if this is an expense (negative amount) or income/savings
      let finalAmount = amount;
      if (transaction.amount < 0 && finalAmount > 0) {
        finalAmount = -finalAmount;
      }
      
      await updateTransaction({
        id: transaction.id,
        description,
        amount: finalAmount,
        category: transaction.category, // Keep the original category, don't allow editing
      });
      
      toast({
        title: "Success",
        description: "Transaction updated successfully"
      });
      onTransactionUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast({
        title: "Error",
        description: "Failed to update transaction",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>
            Update the description and amount of this transaction.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Transaction description"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <AmountInput 
              value={amount} 
              onChange={setAmount} 
              placeholder="Amount"
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <div className="p-2 border rounded-md bg-muted/50">
              {transaction?.category}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTransactionDialog;
