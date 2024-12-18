import React from 'react';
import { ItemFormFieldsProps } from './types';

export const ItemFormFields: React.FC<ItemFormFieldsProps> = ({ formData, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Message (Optional)
      </label>
      <textarea
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
        value={formData.message}
        onChange={(e) => onChange('message', e.target.value)}
      />
    </div>
  );
};