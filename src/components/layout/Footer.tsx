import React from 'react';

export const Footer: React.FC = () => {
  const buildTime = new Date().toLocaleString();
  
  return (
    <footer className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Copyright © {new Date().getFullYear()} VersoBid. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Last build: {buildTime}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Built by <a href="https://betaone.io" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500">betaone.io</a>
          </p>
        </div>
      </div>
    </footer>
  );
};