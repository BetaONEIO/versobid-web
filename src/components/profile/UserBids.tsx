import React from 'react';
import { Bid } from '../../types/bid';

interface UserBidsProps {
  bids: Bid[];
}

export const UserBids: React.FC<UserBidsProps> = ({ bids }) => {
  if (bids.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        No bids placed yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bids.map((bid) => (
        <div key={bid.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {bid.item?.title || 'Untitled Item'}
              </h3>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                Your bid: ${bid.amount.toLocaleString()}
              </p>
            </div>
            <span className={`px-2 py-1 rounded-full text-sm font-medium ${
              bid.status === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
              bid.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            }`}>
              {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};