import React from 'react';
import { BidListCards } from '../components';

import { useBids } from '../../../hooks/useBids';
import { useUser } from '../../../contexts/UserContext';

import { MockBidList } from './mockBidListData';

const BidList: React.FC = () => {
  const { bids, loading, error } = useBids(); // berhubungan dengan backend di dalamnya - bids untuk replace mock data
  // const { loading, error } = useBids();
  const { role } = useUser();

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
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        {role === 'seller' ? 'My Bids' : 'Bids Received'}
      </h1>
      
      {bids.length === 0 ? (
        <div className="flex justify-center items-center min-h-[30vh] bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <div className="text-center">
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {role === 'seller' ? 'No bids sent, yet!' : 'No bids received'}
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {role === 'seller' 
                ? 'Start browsing items to place your first bid'
                : 'Your items will appear here once you receive bids'}
            </p>
          </div>
        </div>
      ) : (
        <BidListCards bids={bids} />
      )}
    </div>
  );
};

export default BidList;