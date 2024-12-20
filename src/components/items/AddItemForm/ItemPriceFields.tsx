import React from 'react';
import { ItemPriceFieldsProps } from './types';

export const ItemPriceFields: React.FC<ItemPriceFieldsProps> = ({ formData, onChange }) => {
  return (
    <div>
      <label htmlFor="price" className="block text-sm font-medium text-gray-700">
        Price ($)
      </label>
      <input
        type="number"
        id="price"
        min="0"
        step="0.01"
        value={formData.price}
        onChange={(e) => onChange('price', Number(e.target.value))}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      />
    </div>
  );
};