import React from 'react';
import { ListingCard } from './ListingCard';
import { Item } from '../../types/item';

interface ListingGridProps {
  listings: Item[];
}

export const ListingGrid: React.FC<ListingGridProps> = ({ listings }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
};