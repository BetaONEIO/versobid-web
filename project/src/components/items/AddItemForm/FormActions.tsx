import React from 'react';

interface FormActionsProps {
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({ onCancel, isSubmitting = false }) => {
  return (
    <div className="flex justify-end space-x-3">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Adding...' : 'Add Item'}
      </button>
    </div>
  );
};