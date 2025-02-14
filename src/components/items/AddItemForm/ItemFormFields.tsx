import React from 'react';
import { ItemFormData } from '../../../types/item';
import { categories } from '../../../utils/constants';

interface ItemFormFieldsProps {
  formData: ItemFormData;
  onChange: (field: keyof ItemFormData, value: string | number) => void;
}

export const ItemFormFields: React.FC<ItemFormFieldsProps> = ({ formData, onChange }) => {
  const handlePriceChange = (field: 'minPrice' | 'maxPrice', value: string) => {
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      onChange(field, numValue);
    }
  };

  return (
    <>
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          What are you looking for?
        </label>
        <input
          id="title"
          type="text"
          required
          value={formData.title}
          onChange={(e) => onChange('title', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          placeholder="Describe the item you want to buy"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Additional Details
        </label>
        <textarea
          id="description"
          rows={4}
          required
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          placeholder="Specify condition, brand preferences, or any other requirements"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Minimum Price ($)
          </label>
          <input
            id="minPrice"
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.minPrice}
            onChange={(e) => handlePriceChange('minPrice', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Maximum Price ($)
          </label>
          <input
            id="maxPrice"
            type="number"
            required
            min={formData.minPrice}
            step="0.01"
            value={formData.maxPrice}
            onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Category
        </label>
        <select
          id="category"
          required
          value={formData.category}
          onChange={(e) => onChange('category', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
    </>
  );
};