import React from 'react';
import { bidService } from '../../../services/bidService';
import { useNotification } from '../../../contexts/NotificationContext';
import { BidActionsProps } from './types';

export const BidActionsContent: React.FC<BidActionsProps> = ({ bid, onActionTaken }) => {
  const { addNotification } = useNotification();

  const handleAction = async (action: 'accept' | 'reject') => {
    try {
      await bidService.updateBidStatus(bid.id, action === 'accept' ? 'accepted' : 'rejected');
      addNotification('success', `Bid ${action}ed successfully!`);
      onActionTaken();
    } catch (error) {
      addNotification('error', `Failed to ${action} bid`);
    }
  };

  return (
    <div className="flex space-x-3">
      <button
        onClick={() => handleAction('accept')}
        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
      >
        Accept
      </button>
      <button
        onClick={() => handleAction('reject')}
        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
      >
        Reject
      </button>
    </div>
  );
};