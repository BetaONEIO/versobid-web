import React from 'react';
import { FormActionsProps } from './types';

export const FormActions: React.FC<FormActionsProps> = ({ onCancel, isSubmitting }) => {
  return (
    <div className="flex justify-end space-x-3">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
      >
        {isSubmitting ? 'Adding...' : 'Add Item'}
      </button>
    </div>
  );
};