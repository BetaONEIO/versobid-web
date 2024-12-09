import React from 'react';
import { Link } from 'react-router-dom';

const categories = [
  { id: 1, name: 'Electronics', icon: '💻', count: 156 },
  { id: 2, name: 'Collectibles', icon: '🏆', count: 89 },
  { id: 3, name: 'Fashion', icon: '👕', count: 234 },
  { id: 4, name: 'Home & Garden', icon: '🏡', count: 167 },
];

export const TrendingCategories: React.FC = () => {
  return (
    <section className="py-12 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          Trending Categories
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to="/signin"
              className="group p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="text-4xl mb-2">{category.icon}</div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {category.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {category.count} items
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};