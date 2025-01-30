import React from 'react';
import { BidAmountFieldProps } from './BidAmountFieldProps';

export const BidAmountField: React.FC<BidAmountFieldProps> = ({ 
  amount, 
  onChange,
  minPrice,
  maxPrice 
}) => {
  const handleAmountChange = (value: string) => {
    // Remove any non-numeric characters except decimal point
    const cleanValue = value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleanValue.split('.');
    const sanitizedValue = parts[0] + (parts.length > 1 ? '.' + parts[1] : '');
    
    // Convert to number, defaulting to 0 if empty
    const numValue = sanitizedValue ? Number(sanitizedValue) : 0;
    
    onChange(numValue);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Offer</label>
      <input
        type="text"
        inputMode="decimal"
        pattern="[0-9]*[.]?[0-9]*"
        required
        min={minPrice}
        max={maxPrice}
        value={amount || ''}
        placeholder="0.00"
        onChange={(e) => handleAmountChange(e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
      />
    </div>
  );
};