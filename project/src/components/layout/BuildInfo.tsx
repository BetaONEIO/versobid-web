import React from 'react';

export const BuildInfo: React.FC = () => {
  const buildTime = new Date().toLocaleString();
  
  return (
    <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">
      Last build: {buildTime}
    </p>
  );
};