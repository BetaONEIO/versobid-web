import React from 'react';
import { BidList } from '../components/bids/BidList';
import { useBids } from '../hooks/useBids';

export const Bids: React.FC = () => {
  const { bids, loading, error } = useBids();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-gray-600 dark:text-gray-300">Loading bids...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Available Bids</h1>
      <BidList bids={bids} />
    </div>
  );
};