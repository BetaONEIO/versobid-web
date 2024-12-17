import React from 'react';
import { RatingCard } from './RatingCard';
import { EmptyState } from '../../ui/EmptyState';
import { UserRatingsProps } from './types';

export const UserRatingsContent: React.FC<UserRatingsProps> = ({ ratings }) => {
  if (ratings.length === 0) {
    return <EmptyState message="No ratings yet" />;
  }

  return (
    <div className="space-y-4">
      {ratings.map((rating) => (
        <RatingCard key={rating.id} rating={rating} />
      ))}
    </div>
  );
};