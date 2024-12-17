import React from 'react';

interface LoadingProps {
  message?: string;
}

export const Loading: React.FC<LoadingProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="text-gray-600 dark:text-gray-300">{message}</div>
    </div>
  );
};