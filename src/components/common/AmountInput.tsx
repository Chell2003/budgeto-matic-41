
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AmountInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  isExpense?: boolean;
}

const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  placeholder = '0.00',
  className,
  isExpense = false,
}) => {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (value) {
      // Format the number with 2 decimal places
      setDisplayValue(Math.abs(value).toFixed(2));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Only allow numbers and decimal points
    if (!/^[0-9]*\.?[0-9]*$/.test(inputValue) && inputValue !== '') return;
    
    setDisplayValue(inputValue);
    
    // Convert to number for the parent component
    const numericValue = parseFloat(inputValue) || 0;
    onChange(isExpense ? -Math.abs(numericValue) : numericValue);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="absolute left-3 inset-y-0 flex items-center pointer-events-none">
        <span className="text-gray-500">₱</span>
      </div>
      <Input
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-7 text-lg font-medium"
      />
    </div>
  );
};

export default AmountInput;
