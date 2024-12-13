import React from 'react';
import { useNavigate } from 'react-router-dom';

export const FormActions: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-end space-x-3">
      <button
        type="button"
        onClick={() => navigate('/bids')}
        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        Add Item
      </button>
    </div>
  );
};