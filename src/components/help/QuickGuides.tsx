import React from 'react';
import { guides } from '../../utils/helpContent';

export const QuickGuides: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Quick Start Guides
      </h2>
      <div className="grid gap-4">
        {guides.map((guide) => (
          <div
            key={guide.id}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {guide.title}
            </h3>
            <p className="mt-1 text-gray-600 dark:text-gray-300">{guide.description}</p>
            <a
              href={guide.link}
              className="mt-2 inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
            >
              Learn more
              <svg
                className="ml-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};