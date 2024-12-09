import React from 'react';
import { Clock, DollarSign } from 'lucide-react';

interface ItemCardProps {
  item: {
    title: string;
    description: string;
    targetPrice: number;
    imageUrl?: string;
    category: string;
    bids: any[];
  };
  onBid?: () => void;
  userRole: string;
}

export default function ItemCard({ item, onBid, userRole }: ItemCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]">
      {item.imageUrl && (
        <img 
          src={item.imageUrl} 
          alt={item.title} 
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.title}</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
            {item.category}
          </span>
        </div>
        
        <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm line-clamp-2">{item.description}</p>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="ml-1 font-semibold">{item.targetPrice.toLocaleString()}</span>
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <span className="ml-1 text-sm">{item.bids.length} bids</span>
          </div>
        </div>
        
        {userRole === 'seller' && (
          <button
            onClick={onBid}
            className="mt-4 w-full bg-indigo-600 dark:bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
          >
            Place Bid
          </button>
        )}
      </div>
    </div>
  );
}