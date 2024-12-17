import React from 'react';

interface EmptyStateProps {
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message }) => {
  return (
    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
      {message}
    </div>
  );
};