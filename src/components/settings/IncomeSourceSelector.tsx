
import React, { useEffect, useState } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';

interface IncomeSourceSelectorProps {
  currentSource: string;
  onSourceChange: (source: string) => void;
}

interface IncomeCategory {
  id: string;
  name: string;
}

const IncomeSourceSelector: React.FC<IncomeSourceSelectorProps> = ({ 
  currentSource,
  onSourceChange
}) => {
  const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIncomeCategories() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('income_categories')
          .select('id, name');
        
        if (error) {
          throw error;
        }
        
        setIncomeCategories(data || []);
      } catch (error) {
        console.error('Error fetching income categories:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchIncomeCategories();
  }, []);

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Income Source</h3>
      <Select 
        value={currentSource} 
        onValueChange={onSourceChange}
        disabled={loading || incomeCategories.length === 0}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select income source" />
        </SelectTrigger>
        <SelectContent>
          {incomeCategories.map((category) => (
            <SelectItem key={category.id} value={category.name}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground mt-1">
        Select your primary source of income
      </p>
    </div>
  );
};

export default IncomeSourceSelector;
