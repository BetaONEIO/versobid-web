import React from 'react';
import { ItemPriceFieldsProps } from './types';

export const ItemPriceFields: React.FC<ItemPriceFieldsProps> = ({ formData, onPriceChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Your Offer
      </label>
      <input
        type="number"
        required
        min="0"
        step="0.01"
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
        value={formData.amount}
        onChange={(e) => onPriceChange(Number(e.target.value))}
      />
    </div>
  );
};