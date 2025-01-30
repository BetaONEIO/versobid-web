import React, { useState } from 'react';
import { Bid } from '../../types/bid';
import { bidService } from '../../services/bidService';
import { useNotification } from '../../contexts/NotificationContext';

interface BidActionsProps {
  bid: Bid;
  onActionTaken: () => void;
}

export const BidActions: React.FC<BidActionsProps> = ({ bid, onActionTaken }) => {
  const { addNotification } = useNotification();
  const [counterAmount, setCounterAmount] = useState<number>(bid.amount);
  const [showCounterOffer, setShowCounterOffer] = useState(false);

  const handleAction = async (action: 'accept' | 'reject' | 'counter') => {
    try {
      if (action === 'counter') {
        await bidService.updateBidStatus(bid.id, 'countered', counterAmount);
        addNotification('success', 'Counter offer sent successfully');
      } else {
        await bidService.updateBidStatus(bid.id, action === 'accept' ? 'accepted' : 'rejected');
        addNotification('success', `Bid ${action}ed successfully!`);
      }
      onActionTaken();
    } catch (error) {
      addNotification('error', `Failed to ${action} bid`);
    }
  };

  const handleCounterResponse = async (accept: boolean) => {
    try {
      await bidService.respondToCounter(bid.id, accept);
      addNotification('success', accept ? 'Counter offer accepted!' : 'Counter offer rejected');
      onActionTaken();
    } catch (error) {
      addNotification('error', 'Failed to respond to counter offer');
    }
  };

  if (bid.status === 'countered' && bid.bidder_id === (window as any).userId) {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium">Counter offer: ${bid.counter_amount}</p>
        <div className="flex space-x-3">
          <button
            onClick={() => handleCounterResponse(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            Accept Counter
          </button>
          <button
            onClick={() => handleCounterResponse(false)}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Reject Counter
          </button>
        </div>
      </div>
    );
  }

  if (bid.status === 'pending') {
    return (
      <div className="space-y-3">
        {showCounterOffer ? (
          <div className="space-y-2">
            <input
              type="number"
              value={counterAmount}
              onChange={(e) => setCounterAmount(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter counter amount"
            />
            <div className="flex space-x-2">
              <button
                onClick={() => handleAction('counter')}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Send Counter
              </button>
              <button
                onClick={() => setShowCounterOffer(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex space-x-3">
            <button
              onClick={() => handleAction('accept')}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              Accept
            </button>
            <button
              onClick={() => handleAction('reject')}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Reject
            </button>
            <button
              onClick={() => setShowCounterOffer(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Counter
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="text-sm font-medium">
      Status: {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
    </div>
  );
};