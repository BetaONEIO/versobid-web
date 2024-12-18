import React from 'react';
import { BidFormContentProps } from './types';

export const BidFormContent: React.FC<BidFormContentProps> = ({
  item,
  formData,
  onSubmit,
  onChange
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
          onChange={(e) => onChange('amount', Number(e.target.value))}
        />
      </div>

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

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Shipping Option
        </label>
        <select
          value={formData.shippingOption}
          onChange={(e) => onChange('shippingOption', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
        >
          {item.shipping_options.map((option) => (
            <option key={option.type} value={option.type}>
              {option.type === 'shipping' ? 'Shipping' : 'Pickup'}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
      >
        Place Bid
      </button>
    </form>
  );
};