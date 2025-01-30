import React, { useState } from 'react';
import { useUser } from '../../../contexts/UserContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { bidService } from '../../../services/bidService';
import { Item } from '../../../types/item';
import { BidAmountField } from './BidAmountField';
import { BidMessageField } from './BidMessageField';

interface BidFormProps {
  item: Item;
  onBidSubmitted: () => void;
}

export const BidForm: React.FC<BidFormProps> = ({ item, onBidSubmitted }) => {
  const { auth, role } = useUser();
  const { addNotification } = useNotification();
  const [amount, setAmount] = useState<number>(role === 'seller' ? 0 : item.minPrice);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.user) return;

    // For buyers, validate against price range
    if (role === 'buyer' && (amount < item.minPrice || amount > item.maxPrice)) {
      addNotification('error', `Please enter an amount between £${item.minPrice} and £${item.maxPrice}`);
      return;
    }

    try {
      await bidService.createBid(item.id, amount, message);
      addNotification('success', 'Bid placed successfully! Please wait for the seller to respond.');
      setSubmitted(true);
      onBidSubmitted();
    } catch (error) {
      addNotification('error', 'Failed to place bid');
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 dark:bg-green-900 p-4 rounded-md text-center">
        <p className="text-green-800 dark:text-green-200 font-medium">
          Thanks for your bid! Please wait for the seller to respond.
        </p>
        <p className="text-green-600 dark:text-green-300 text-sm mt-2">
          You'll be notified when they make a decision.
        </p>
      </div>
    );
  }

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