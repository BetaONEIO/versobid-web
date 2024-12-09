import React from 'react';
import { Bid } from '../../types';

interface BidCardProps {
  bid: Bid;
  onSelect?: (bid: Bid) => void;
}

export const BidCard: React.FC<BidCardProps> = ({ bid, onSelect }) => {
  return (
    <div 
      className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200"
      onClick={() => onSelect?.(bid)}
    >
      <h3 className="text-lg font-semibold text-gray-900">{bid.title}</h3>
      <p className="mt-2 text-sm text-gray-600">{bid.description}</p>
      <div className="mt-4 flex justify-between items-center">
        <span className="text-lg font-medium text-gray-900">
          ${bid.amount.toLocaleString()}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          bid.status === 'open' ? 'bg-green-100 text-green-800' :
          bid.status === 'closed' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
        </span>
      </div>
    </div>
  );
};