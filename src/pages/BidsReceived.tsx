import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { bidService } from '../services/bidService';
import { Bid } from '../types/bid';
import { formatCurrency, formatDate } from '../utils/formatters';
import {useNavigate } from 'react-router-dom';
export const BidsReceived: React.FC = () => {
  const { auth, role } = useUser();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchBids = async () => {
      if (!auth.user?.id) return;
      try {
        const data = role === 'buyer' 
          ? await bidService.getReceivedBids(auth.user.id)
          : await bidService.getBidsForItem(auth.user.id);
        setBids(data);
        console.log(data);
      } catch (error) {
        console.error('Failed to fetch bids:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, [auth.user?.id, role]);

  if (loading) {
    return <div className="text-center py-8">Loading bids...</div>;
  }

  if (bids.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            You've received no bids, yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {role === 'buyer' ? (
        <h1 className="text-2xl font-bold mb-6">Bids Received</h1>
      ) : (
        <h1 className="text-2xl font-bold mb-6">Bids Sent</h1>
      )}
      
      <div className="bg-white dark:bg-gray-800 shadow overflow-x-auto rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Bidder
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {bids.map((bid) => (
              <tr onClick={()=>navigate(`/bids/${bid.id}`)} key={bid.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[50px] sm:max-w-xs">
                    {bid.item?.title}
                  </div>
                </td>
                <td className="px-6 whitespace-nowrap py-4 ">
                  <div className="text-sm text-gray-500 dark:text-gray-300 truncate max-w-[50px] sm:max-w-xs">
                    {bid.bidder?.username}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(bid.amount)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-300">
                    {formatDate(bid.created_at)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    bid.status === 'accepted' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : bid.status === 'rejected'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};