import React from 'react';
import { BidAmountFieldProps } from './BidAmountFieldProps';
import { useUser } from '../../../contexts/UserContext';

export const BidAmountField: React.FC<BidAmountFieldProps> = ({ 
  amount, 
  onChange,
  minPrice,
  maxPrice 
}) => {
  const { role } = useUser();
  const isSeller = role === 'seller';

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
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Your {isSeller ? 'Bid' : 'Offer'}
      </label>
      <div className="mt-1 relative">
        <input
          type="text"
          inputMode="decimal"
          pattern="[0-9]*[.]?[0-9]*"
          required
          min={isSeller ? undefined : minPrice}
          max={isSeller ? undefined : maxPrice}
          value={amount || ''}
          placeholder="0.00"
          onChange={(e) => handleAmountChange(e.target.value)}
          className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
        />
        {!isSeller && (
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Price range: £{minPrice?.toFixed(2)} - £{maxPrice?.toFixed(2)}
          </div>
        )}
      </div>
    </div>
  );
};