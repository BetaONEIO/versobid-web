import React from 'react';
import { BidAmountField } from './BidAmountField';
import { BidMessageField } from './BidMessageField';
import { Item } from '../../../types/item';
import { bidService } from '../../../services/bidService';
import { useUser } from '../../../contexts/UserContext';
import { useNotification } from '../../../contexts/NotificationContext';

interface BidFormContentProps {
  item: Item;
  onBidSubmitted: () => void;
}

export const BidFormContent: React.FC<BidFormContentProps> = ({ item, onBidSubmitted }) => {
  const { auth } = useUser();
  const { addNotification } = useNotification();
  const [amount, setAmount] = React.useState<number>(item.minPrice);
  const [message, setMessage] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.user) return;

    try {
      await bidService.createBid(item.id, amount, message);
      addNotification('success', 'Bid placed successfully!');
      onBidSubmitted();
    } catch (error) {
      addNotification('error', 'Failed to place bid');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <BidAmountField 
        amount={amount}
        onChange={setAmount}
        minPrice={item.minPrice}
        maxPrice={item.maxPrice}
      />
      
      <BidMessageField
        message={message}
        onChange={setMessage}
      />

      <button
        type="submit"
        className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
      >
        Place Bid
      </button>
    </form>
  );
};