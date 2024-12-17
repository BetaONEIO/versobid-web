import React from 'react';
import { Item } from '../../types/item';
import { Link } from 'react-router-dom';

interface UserItemsProps {
  items: Item[];
}

export const UserItems: React.FC<UserItemsProps> = ({ items }) => {
  if (items.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        No items listed yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <div key={item.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {item.title}
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-300 line-clamp-2">
            {item.description}
          </p>
          <div className="mt-4 flex justify-between items-center">
            <span className="text-lg font-medium text-gray-900 dark:text-white">
              ${item.price}
            </span>
            <Link
              to={`/items/${item.id}`}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
            >
              View Details
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};