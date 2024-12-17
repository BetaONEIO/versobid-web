import React, { useState } from 'react';
import { BidFormData } from '../../types/bid';
import { Item } from '../../types/item';
import { useUser } from '../../contexts/UserContext';
import { bidService } from '../../services/bidService';
import { useNotification } from '../../contexts/NotificationContext';

interface BidFormProps {
  item: Item;
  onBidSubmitted: () => void;
}

export const BidForm: React.FC<BidFormProps> = ({ item, onBidSubmitted }) => {
  const { auth } = useUser();
  const { addNotification } = useNotification();

  // Initialize form state
  const [formData, setFormData] = useState<BidFormData>({
    amount: item.price,
    message: '',
    shippingOption: item.shipping_options[0]?.type || 'shipping',
  });

  // Handle input field changes
  const handleChange = (field: keyof BidFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Submit the bid form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth.user) {
      addNotification('error', 'You must be logged in to place a bid.');
      return;
    }

    try {
      const response = await bidService.createBid({
        itemId: item.id,
        bidderId: auth.user.id,
        amount: formData.amount,
        message: formData.message,
        shippingOption: formData.shippingOption,
      });

      if (!response.success) {
        addNotification('error', response.message || 'Failed to place bid.');
        return;
      }

      addNotification('success', 'Bid placed successfully!');
      onBidSubmitted();
    } catch (error) {
      console.error('Error placing bid:', error);
      addNotification('error', 'An unexpected error occurred.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          onChange={(e) => handleChange('amount', Number(e.target.value))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Message (Optional)
        </label>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          value={formData.message}
          onChange={(e) => handleChange('message', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Shipping Option
        </label>
        <select
          value={formData.shippingOption}
          onChange={(e) => handleChange('shippingOption', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="shipping">Shipping</option>
          <option value="pickup">Pickup</option>
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