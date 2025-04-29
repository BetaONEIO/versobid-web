import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../../utils/formatters';
import { ItemCardProps } from './types';

export const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  // Only show price range if both prices are set and greater than 0
  const showPriceRange = item.minPrice > 0 || item.maxPrice > 0;
  const priceDisplay = showPriceRange 
    ? `${formatCurrency(item.minPrice)} - ${formatCurrency(item.maxPrice)}`
    : 'Price not set';

  return (
    <Link to={`/listings/${item.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{item.title}</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {item.category}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
            {item.description}
          </p>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Budget:</span>
              <span className="ml-2 text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {priceDisplay}
              </span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Posted by: {item.sellerUsername}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};