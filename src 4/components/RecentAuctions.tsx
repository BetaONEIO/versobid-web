import React from 'react';
import { Clock, DollarSign, CheckCircle } from 'lucide-react';
import { useStore } from '../stores/store';

export default function RecentAuctions() {
  const { items } = useStore();

  // Get completed items (those with accepted bids), sort by date, and take last 30
  const recentAuctions = items
    .filter(item => item.status === 'closed')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 30);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Auctions</h2>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {recentAuctions.map((item) => {
          const winningBid = item.bids.find(bid => bid.status === 'accepted');
          
          return (
            <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</h3>
                    <span className="ml-2 px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                      Completed
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                    {item.description}
                  </p>
                </div>
                <div className="ml-4 flex flex-col items-end">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span className="font-medium">
                      {winningBid ? winningBid.amount.toLocaleString() : item.targetPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              {winningBid && (
                <div className="mt-2 flex items-center text-sm text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>Sold for ${winningBid.amount.toLocaleString()}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}