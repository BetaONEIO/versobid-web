import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../../utils/formatters';
import { Item } from '../../../types/item';

interface UserItemCardProps {
  item: Item;
}

export const UserItemCard: React.FC<UserItemCardProps> = ({ item }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {item.title}
      </h3>
      <p className="mt-2 text-gray-600 dark:text-gray-300 line-clamp-2">
        {item.description}
      </p>
      <div className="mt-4 flex justify-between items-center">
        <span className="text-lg font-medium text-gray-900 dark:text-white">
          {formatCurrency(item.price)}
        </span>
        <Link
          to={`/items/${item.id}`}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};