import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useUser } from '../../../../contexts/UserContext';
import { useNotification } from '../../../../contexts/NotificationContext';
import { usePayPalStatus } from '../../../../hooks/usePayPalStatus';

import { bidService } from '../../../../services/bidService';
import { PayPalLinkButton } from '../../../../components/profile/PayPalLinkButton';
import { useProfileCompletion } from '../../../../hooks/useProfileCompletion';
import { ProfileCompletionBanner } from '../../../../components/profile/ProfileCompletionBanner';
import { getProfileCompletionMessage } from '../../../../utils/profileCompletion';

import { BidFormProps } from './BidForm.types';

const BidForm: React.FC<BidFormProps> = ({ item }) => {
  const navigate = useNavigate();
  const { auth } = useUser();
  const { addNotification } = useNotification();
  const { isLinked: isPayPalLinked } = usePayPalStatus();
  const profileStatus = useProfileCompletion();
  const [amount, setAmount] = useState<string>('');
  const [message, setMessage] = useState('');
  const [shippingCost, setShippingCost] = useState<string>('');
  const [showPayPalLink, setShowPayPalLink] = useState(false);

  // Check if item supports shipping
  const supportsShipping = item?.shippingOptions == "shipping";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.user) return;
    if (!item) return;

    // Check profile completion for bidding
    if (!profileStatus.canBid) {
      const message = getProfileCompletionMessage(profileStatus, 'bid');
      addNotification('error', message);
      return;
    }

    const bidAmount = parseFloat(amount);
    const shipping = parseFloat(shippingCost) || 0;

    if (isNaN(bidAmount) || bidAmount <= 0) {
      addNotification('error', 'Please enter a valid bid amount');
      return;
    }

    if (bidAmount < (item.minPrice ?? 0)) {
      addNotification('error', `Bid amount must be at least £${item.minPrice}`);
      return;
    }

    if (item.maxPrice && bidAmount > item.maxPrice) {
      addNotification('error', `Bid amount cannot exceed £${item.maxPrice}`);
      return;
    }

    // For shipping items, validate shipping cost
    if (supportsShipping && shipping <= 0) {
      addNotification('error', 'Please enter shipping cost for delivery');
      return;
    }

    // Build message with shipping information
    let bidMessage = message;
    let totalWithShipping = bidAmount;
    if (supportsShipping && shipping > 0) {
      totalWithShipping = bidAmount + shipping;
      bidMessage = `${message ? message + '\n\n' : ''}Bid: £${bidAmount.toFixed(2)}\nShipping: £${shipping.toFixed(2)}\nTotal: £${totalWithShipping.toFixed(2)}`;
    }

    // berhubungan dengan backend untuk submit form bid
    try {
      await bidService.createBid(item.id, totalWithShipping, bidMessage);
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

  // Show profile completion banner first if profile is incomplete
  if (!profileStatus.canBid) {
    return (
      <div className="space-y-4">
        <ProfileCompletionBanner status={profileStatus} action="bid" />
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
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Offer</label>
        <div className="relative mt-1">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">£</span>
          <input
            type="number"
            required
            min={item?.minPrice}
            max={item?.maxPrice}
            step="0.01"
            placeholder={`Enter amount (min £${item?.minPrice ?? 0})`}
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

      {/* Conditional shipping cost field */}
      {supportsShipping && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Shipping Cost
          </label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">£</span>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              placeholder="Enter shipping cost"
              className="block w-full pl-6 pr-3 py-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={shippingCost}
              onChange={(e) => setShippingCost(e.target.value)}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            This will be added to your bid amount
          </p>
        </div>
      )}

      {/* Total amount display */}
      {supportsShipping && amount && shippingCost && (
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
          <div className="flex justify-between text-sm">
            <span>Bid Amount:</span>
            <span>£{parseFloat(amount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping:</span>
            <span>£{parseFloat(shippingCost).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-medium text-base border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
            <span>Total:</span>
            <span>£{(parseFloat(amount) + parseFloat(shippingCost)).toFixed(2)}</span>
          </div>
        </div>
      )}

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