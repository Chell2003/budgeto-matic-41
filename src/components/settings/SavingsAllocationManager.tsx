import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { PiggyBank, Plus, Trash2 } from 'lucide-react';
import { getSavingsAllocations, addSavingsAllocation, deleteSavingsAllocation } from '@/services/financeService';
import { SavingsAllocation } from '@/types/database';

const SavingsAllocationManager: React.FC = () => {
  const [allocations, setAllocations] = useState<SavingsAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newPercentage, setNewPercentage] = useState('');
  const [totalPercentage, setTotalPercentage] = useState(0);

  const fetchAllocations = async () => {
    try {
      setLoading(true);
      const data = await getSavingsAllocations();
      setAllocations(data as SavingsAllocation[]);
      
      const total = data.reduce((sum, allocation) => sum + allocation.percentage, 0);
      setTotalPercentage(total);
    } catch (error) {
      console.error('Error fetching savings allocations:', error);
      toast.error('Failed to load savings allocations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, []);

  const handleAddAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newName || !newPercentage) {
      toast.error('Please enter both a name and percentage');
      return;
    }
    
    const percentage = parseFloat(newPercentage);
    if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
      toast.error('Percentage must be between 0 and 100');
      return;
    }
    
    if (totalPercentage + percentage > 100) {
      toast.error(`Cannot allocate more than 100% of savings. ${(100 - totalPercentage).toFixed(1)}% remaining.`);
      return;
    }
    
    try {
      await addSavingsAllocation({
        name: newName,
        percentage: percentage
      });
      
      toast.success('Savings allocation added');
      setNewName('');
      setNewPercentage('');
      await fetchAllocations();
    } catch (error) {
      console.error('Error adding savings allocation:', error);
      toast.error('Failed to add savings allocation');
    }
  };

  const handleDeleteAllocation = async (id: string) => {
    try {
      await deleteSavingsAllocation(id);
      toast.success('Savings allocation deleted');
      await fetchAllocations();
    } catch (error) {
      console.error('Error deleting savings allocation:', error);
      toast.error('Failed to delete savings allocation');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PiggyBank className="h-5 w-5" />
          Savings Allocations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Total Allocated</span>
                <span className="text-sm font-medium">{totalPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={totalPercentage} className="h-2" />
            </div>
            
            <div className="space-y-2">
              {allocations.map((allocation) => (
                <div 
                  key={allocation.id} 
                  className="flex items-center justify-between bg-muted p-3 rounded-md"
                >
                  <div>
                    <p className="font-medium">{allocation.name}</p>
                    <p className="text-sm text-muted-foreground">{allocation.percentage.toFixed(1)}% of savings</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAllocation(allocation.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              
              {allocations.length === 0 && (
                <p className="text-center text-muted-foreground py-2">No allocations yet</p>
              )}
            </div>
            
            <form onSubmit={handleAddAllocation} className="space-y-3 pt-2">
              <div>
                <label className="text-sm font-medium">Goal Name</label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Emergency Fund"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Percentage</label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={newPercentage}
                    onChange={(e) => setNewPercentage(e.target.value)}
                    placeholder="20"
                    className="text-right"
                  />
                  <span className="text-lg">%</span>
                </div>
              </div>
              <Button type="submit" className="w-full">
                <Plus className="h-4 w-4 mr-1" />
                Add Allocation
              </Button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SavingsAllocationManager;
