import React from 'react';
import { ItemFormData } from '../../../types/item';

interface ItemPriceFieldsProps {
  formData: ItemFormData;
  onChange: (field: keyof ItemFormData, value: number) => void;
}

export const ItemPriceFields: React.FC<ItemPriceFieldsProps> = ({ formData, onChange }) => {
  return (
    <div>
      <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Price ($)
      </label>
      <input
        id="price"
        type="number"
        min="0"
        step="0.01"
        required
        value={formData.price}
        onChange={(e) => onChange('price', Number(e.target.value))}
        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      />
    </div>
  );
};