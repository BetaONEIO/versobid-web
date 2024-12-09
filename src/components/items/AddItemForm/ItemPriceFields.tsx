import React from 'react';
import { ItemFormData } from '../../../types';

interface ItemPriceFieldsProps {
  formData: ItemFormData;
  onPriceChange: (field: 'minPrice' | 'maxPrice', value: number) => void;
}

export const ItemPriceFields: React.FC<ItemPriceFieldsProps> = ({ formData, onPriceChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Desired Price Range ($)
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="minPrice" className="block text-sm text-gray-500 dark:text-gray-400">
            Minimum Price
          </label>
          <input
            type="number"
            id="minPrice"
            min="0"
            step="0.01"
            required
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            value={formData.minPrice}
            onChange={(e) => onPriceChange('minPrice', Number(e.target.value))}
          />
        </div>
        <div>
          <label htmlFor="maxPrice" className="block text-sm text-gray-500 dark:text-gray-400">
            Maximum Price
          </label>
          <input
            type="number"
            id="maxPrice"
            min={formData.minPrice}
            step="0.01"
            required
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            value={formData.maxPrice}
            onChange={(e) => onPriceChange('maxPrice', Number(e.target.value))}
          />
        </div>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
        Sellers will see the median of your price range
      </p>
    </div>
  );
};