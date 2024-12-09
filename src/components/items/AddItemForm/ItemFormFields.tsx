import React from 'react';
import { categories } from '../../utils/constants';
import { ItemFormData } from '../../types';

interface ItemFormFieldsProps {
  formData: ItemFormData;
  onChange: (field: keyof ItemFormData, value: string | number) => void;
}

export const ItemFormFields: React.FC<ItemFormFieldsProps> = ({ formData, onChange }) => {
  return (
    <>
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Title
        </label>
        <input
          type="text"
          id="title"
          required
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
          value={formData.title}
          onChange={(e) => onChange('title', e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          required
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Category
        </label>
        <select
          id="category"
          required
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
          value={formData.category}
          onChange={(e) => onChange('category', e.target.value)}
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