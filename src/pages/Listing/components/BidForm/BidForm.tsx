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
  const [amount, setAmount] = useState<number>(item?.minPrice ?? 0);
  const [message, setMessage] = useState('');
  const [showPayPalLink, setShowPayPalLink] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.user) return;
    if (!item) return;
    // berhubungan dengan backend untuk submit form bid
    try {
      await bidService.createBid(item.id, amount, message);
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
        <label className="block text-sm font-medium text-gray-700">Your Offer</label>
        <input
          type="number"
          required
          min={item?.minPrice}
          max={item?.maxPrice}
          step="0.01"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Message (Optional)</label>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
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

export default BidForm;