import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export const HelpHeader: React.FC = () => {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Help Center</h1>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
        Find answers to common questions and learn how to make the most of VersoBid
      </p>
      <div className="mt-6 max-w-xl mx-auto">
        <div className="relative">
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="Search for help..."
          />
          <MagnifyingGlassIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>
    </div>
  );
};