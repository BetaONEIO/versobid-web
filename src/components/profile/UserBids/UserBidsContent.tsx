import React from 'react';
import { BidCard } from './BidCard';
import { EmptyState } from '../../ui/EmptyState';
import { UserBidsProps } from './types';

export const UserBidsContent: React.FC<UserBidsProps> = ({ bids }) => {
  if (bids.length === 0) {
    return <EmptyState message="No bids placed yet" />;
  }

  return (
    <div className="space-y-4">
      {bids.map((bid) => (
        <BidCard key={bid.id} bid={bid} />
      ))}
    </div>
  );
};