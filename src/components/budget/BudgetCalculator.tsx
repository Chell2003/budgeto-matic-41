
import React, { useState } from 'react';
import { Calculator } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BudgetCalculatorProps {
  onCalculated: (value: number) => void;
}

const BudgetCalculator: React.FC<BudgetCalculatorProps> = ({ onCalculated }) => {
  const [open, setOpen] = useState(false);
  const [dailyAmount, setDailyAmount] = useState<string>('');
  const [daysPerMonth, setDaysPerMonth] = useState<string>('30');
  const [monthlyTotal, setMonthlyTotal] = useState<number | null>(null);

  const handleCalculate = () => {
    const daily = parseFloat(dailyAmount) || 0;
    const days = parseInt(daysPerMonth) || 30;
    const total = daily * days;
    setMonthlyTotal(total);
  };

  const handleApply = () => {
    if (monthlyTotal !== null) {
      onCalculated(monthlyTotal);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          <Calculator size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Budget Calculator</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Daily Amount (₱)</label>
            <Input 
              type="number" 
              value={dailyAmount}
              onChange={(e) => setDailyAmount(e.target.value)}
              placeholder="Enter daily amount" 
              className="bg-white"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Days per Month</label>
            <Input 
              type="number" 
              value={daysPerMonth}
              onChange={(e) => setDaysPerMonth(e.target.value)}
              placeholder="30" 
              className="bg-white"
            />
          </div>
          
          <Button 
            type="button" 
            onClick={handleCalculate} 
            className="w-full"
          >
            Calculate
          </Button>
          
          {monthlyTotal !== null && (
            <div className="mt-4 p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">Monthly Budget:</p>
              <p className="text-lg font-bold">₱{monthlyTotal.toFixed(2)}</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            type="button" 
            onClick={handleApply} 
            disabled={monthlyTotal === null}
          >
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetCalculator;
