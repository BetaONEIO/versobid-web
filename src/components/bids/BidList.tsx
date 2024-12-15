import React from 'react';
import { Bid } from '../../types';
import { BidCard } from './BidCard';

interface BidListProps {
  bids: Bid[];
  onBidSelect?: (bid: Bid) => void;
}

export const BidList: React.FC<BidListProps> = ({ bids, onBidSelect }) => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {bids.map((bid) => (
        <BidCard 
          key={bid.id} 
          bid={bid} 
          onSelect={onBidSelect}
        />
      ))}
    </div>
  );
};