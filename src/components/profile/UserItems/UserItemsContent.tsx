import React from 'react';
import { UserItemCard } from './UserItemCard';
import { EmptyState } from '../../ui/EmptyState';
import { UserItemsProps } from './types';

export const UserItemsContent: React.FC<UserItemsProps> = ({ items }) => {
  if (items.length === 0) {
    return <EmptyState message="No items listed yet" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <UserItemCard key={item.id} item={item} />
      ))}
    </div>
  );
};