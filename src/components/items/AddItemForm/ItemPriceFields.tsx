import React from 'react';
import { ItemFormData } from '../../../types/item';

interface ItemPriceFieldsProps {
  formData: ItemFormData;
  onPriceChange: (value: number) => void;
}

export const ItemPriceFields: React.FC<ItemPriceFieldsProps> = ({ formData, onPriceChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Price
      </h3>
      <div>
        <label htmlFor="price" className="block text-sm text-gray-500 dark:text-gray-400">
          Price ($)
        </label>
        <input
          type="number"
          id="price"
          min="0"
          step="0.01"
          required
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
          value={formData.price}
          onChange={(e) => onPriceChange(Number(e.target.value))}
        />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
        Set a fair price for your item
      </p>
    </div>
  );
};