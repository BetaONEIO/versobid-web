import React, { useState } from 'react';
import { Modal } from './Modal';

interface DeleteListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  hasPendingBids: boolean;
}

export const DeleteListingModal: React.FC<DeleteListingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  hasPendingBids
}) => {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(reason);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Listing">
      <form onSubmit={handleSubmit} className="space-y-4">
        {hasPendingBids && (
          <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-md">
            <p className="text-yellow-800 dark:text-yellow-200">
              Warning: This listing has pending bids. Deleting it will notify all bidders.
            </p>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Why are you deleting this listing?
          </label>
          <textarea
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            rows={3}
            placeholder="Please provide a reason..."
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
          >
            Delete Listing
          </button>
        </div>
      </form>
    </Modal>
  );
};