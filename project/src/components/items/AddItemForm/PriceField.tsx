import React from 'react';
import { PriceFieldProps } from './types';

export const PriceField: React.FC<PriceFieldProps> = ({ value, onChange, label, min = 0 }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <input
        type="number"
        min={min}
        step="0.01"
        required
        value={value || ''}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
      />
    </div>
  );
};