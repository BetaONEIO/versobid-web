import React from 'react';
import { ItemFormData } from '../../../types/item';

interface ItemPriceFieldsProps {
  formData: ItemFormData;
  onChange: (field: keyof ItemFormData, value: number) => void;
}

export const ItemPriceFields: React.FC<ItemPriceFieldsProps> = ({ formData, onChange }) => {
  const handlePriceChange = (field: 'minPrice' | 'maxPrice', value: string) => {
    // Remove any non-numeric characters except decimal point
    const cleanValue = value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleanValue.split('.');
    const sanitizedValue = parts[0] + (parts.length > 1 ? '.' + parts[1] : '');
    
    // Convert to number, defaulting to 0 if empty
    const numValue = sanitizedValue ? Number(sanitizedValue) : 0;
    
    onChange(field, numValue);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Minimum Price ($)
        </label>
        <input
          type="text"
          inputMode="decimal"
          pattern="[0-9]*[.]?[0-9]*"
          required
          value={formData.minPrice || ''}
          placeholder="0.00"
          onChange={(e) => handlePriceChange('minPrice', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Maximum Price ($)
        </label>
        <input
          type="text"
          inputMode="decimal"
          pattern="[0-9]*[.]?[0-9]*"
          required
          min={formData.minPrice}
          value={formData.maxPrice || ''}
          placeholder="0.00"
          onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
};