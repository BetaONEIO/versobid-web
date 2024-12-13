import React from 'react';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="bg-red-50 dark:bg-red-900 p-4 rounded-md">
      <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
    </div>
  );
};