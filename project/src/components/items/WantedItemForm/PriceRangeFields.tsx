import React from 'react';
import { formatCurrency } from '../../../utils/formatters';

interface PriceRangeFieldsProps {
  minPrice: number;
  maxPrice: number;
  onChange: (field: 'minPrice' | 'maxPrice', value: number) => void;
}

export const PriceRangeFields: React.FC<PriceRangeFieldsProps> = ({
  minPrice,
  maxPrice,
  onChange
}) => {
  const handlePriceChange = (field: 'minPrice' | 'maxPrice', value: string) => {
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue >= 0) {
      onChange(field, numValue);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Your Budget Range
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-500 dark:text-gray-400">
            Minimum Price
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">£</span>
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={minPrice || ''}
              onChange={(e) => handlePriceChange('minPrice', e.target.value)}
              className="pl-7 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-500 dark:text-gray-400">
            Maximum Price
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">£</span>
            </div>
            <input
              type="number"
              min={minPrice}
              step="0.01"
              required
              value={maxPrice || ''}
              onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
              className="pl-7 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>
      {minPrice > 0 && maxPrice > 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Sellers will see that you're willing to pay between {formatCurrency(minPrice)} and {formatCurrency(maxPrice)}
        </p>
      )}
    </div>
  );
};