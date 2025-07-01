import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useUser } from '../../../../contexts/UserContext';
import { useNotification } from '../../../../contexts/NotificationContext';
import { usePayPalStatus } from '../../../../hooks/usePayPalStatus';

import { bidService } from '../../../../services/bidService';
import { PayPalLinkButton } from '../../../../components/profile/PayPalLinkButton';

import { BidFormProps } from './BidForm.types';

const BidForm: React.FC<BidFormProps> = ({ item }) => {
  const navigate = useNavigate();
  const { auth } = useUser();
  const { addNotification } = useNotification();
  const { isLinked: isPayPalLinked } = usePayPalStatus();
  const [amount, setAmount] = useState<string>('');
  const [message, setMessage] = useState('');
  const [showPayPalLink, setShowPayPalLink] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.user) return;
    if (!item) return;

    const bidAmount = parseFloat(amount);
    if (isNaN(bidAmount) || bidAmount <= 0) {
      addNotification('error', 'Please enter a valid bid amount');
      return;
    }

    if (bidAmount < (item.minPrice ?? 0)) {
      addNotification('error', `Bid amount must be at least $${item.minPrice}`);
      return;
    }

    if (item.maxPrice && bidAmount > item.maxPrice) {
      addNotification('error', `Bid amount cannot exceed $${item.maxPrice}`);
      return;
    }

    // berhubungan dengan backend untuk submit form bid
    try {
      await bidService.createBid(item.id, bidAmount, message);
      addNotification('success', 'Bid placed successfully!');
      navigate('/bids')
    } catch (error) {
      // berhubungan dengan backend untuk handle kalau submitnya tidak berhasil
      if (error instanceof Error && error.message.includes('PayPal')) {
        setShowPayPalLink(true);
        addNotification('error', 'Link your PayPal account to place bids and receive payments');
      } else {
        addNotification('error', 'Failed to place bid');
      }
    }
  };

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
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Offer</label>
        <div className="relative mt-1">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
          <input
            type="number"
            required
            min={item?.minPrice}
            max={item?.maxPrice}
            step="0.01"
            placeholder={`Enter amount (min $${item?.minPrice ?? 0})`}
            className="block w-full pl-6 pr-3 py-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message (Optional)</label>
        <textarea
          placeholder="Add a message to the seller..."
          className=" px-3 py-2 mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!amount || parseFloat(amount) <= 0}
      >
        Place Bid
      </button>
    </form>
  );
};

export default BidForm;