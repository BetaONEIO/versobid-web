import React from 'react';
import { formatCurrency } from '../../../utils/formatters';
import { getBidStatusStyles } from '../../../utils/bidUtils';
import { Bid } from '../../../types/bid';

interface BidCardProps {
  bid: Bid;
}

export const BidCard: React.FC<BidCardProps> = ({ bid }) => {
  const statusStyles = getBidStatusStyles(bid.status);

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {bid.item?.title}
          </h3>
          <p className="mt-1 text-gray-600 dark:text-gray-300">
            Your bid: {formatCurrency(bid.amount)}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-sm font-medium ${statusStyles}`}>
          {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
        </span>
      </div>
    </div>
  );
};