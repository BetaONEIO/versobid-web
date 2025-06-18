import React, { useState } from 'react';
import { useUser } from '../../../contexts/UserContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { usePayPalStatus } from '../../../hooks/usePayPalStatus';
import { bidService } from '../../../services/bidService';
import { Item } from '../../../types/item';
import { BidAmountField } from './BidAmountField';
import { BidMessageField } from './BidMessageField';
import { PayPalLinkButton } from '../../profile/PayPalLinkButton';

interface BidFormProps {
  item: Item;
  onBidSubmitted: () => void;
}

export const BidForm: React.FC<BidFormProps> = ({ item, onBidSubmitted }) => {
  const { auth } = useUser();
  const { addNotification } = useNotification();
  const { isLinked: isPayPalLinked } = usePayPalStatus();
  const [amount, setAmount] = useState<number>(item.minPrice);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showPayPalLink, setShowPayPalLink] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.user) return;

    try {
      await bidService.createBid(item.id, amount, message);
      addNotification('success', 'Bid placed successfully! Please wait for the seller to respond.');
      setSubmitted(true);
      onBidSubmitted();
    } catch (error) {
      if (error instanceof Error && error.message.includes('PayPal')) {
        setShowPayPalLink(true);
        addNotification('error', 'Link your PayPal account to place bids and receive payments');
      } else {
        addNotification('error', 'Failed to place bid');
      }
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

  if (showPayPalLink || !isPayPalLinked) {
    return (
      <div className="space-y-4">
        <PayPalLinkButton />
        {isPayPalLinked && (
          <button
            onClick={() => setShowPayPalLink(false)}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
          >
            Continue to place bid
          </button>
        )}
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