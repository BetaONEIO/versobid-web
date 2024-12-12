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
  const [formData, setFormData] = useState<BidFormData>({
    amount: item.price,
    message: '',
    shippingOption: item.shipping[0].type
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.user) return;

    try {
      await bidService.createBid({
        itemId: item.id,
        bidderId: auth.user.id,
        ...formData
      });
      addNotification('success', 'Bid placed successfully!');
      onBidSubmitted();
    } catch (error) {
      addNotification('error', 'Failed to place bid');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Your Offer</label>
        <input
          type="number"
          required
          min="0"
          step="0.01"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Message (Optional)</label>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Shipping Preference</label>
        <select
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          value={formData.shippingOption}
          onChange={(e) => setFormData({ ...formData, shippingOption: e.target.value })}
        >
          {item.shipping.map((option) => (
            <option key={option.type} value={option.type}>
              {option.type === 'shipping' 
                ? `Shipping (+$${option.cost})` 
                : `Pickup (${option.location})`}
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