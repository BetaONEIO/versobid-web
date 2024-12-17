import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { Bid } from '../../types/bid';
import { Transaction, RatingFormData } from '../../types/transaction';
import { bidService } from '../../services/bidService';
import { transactionService } from '../../services/transactionService';
import { useNotification } from '../../contexts/NotificationContext';
import { RatingForm } from '../rating/RatingForm';

interface BidActionsProps {
  bid: Bid;
  onActionTaken: () => void;
}

export const BidActions: React.FC<BidActionsProps> = ({ bid, onActionTaken }) => {
  const { auth } = useUser();
  const { addNotification } = useNotification();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [showRatingForm, setShowRatingForm] = useState(false);

  useEffect(() => {
    if (bid.status === 'accepted') {
      loadTransaction();
    }
  }, [bid.status]);

  const loadTransaction = async () => {
    try {
      const data = await transactionService.getTransaction(bid.id);
      setTransaction(data);
    } catch (error) {
      console.error('Error loading transaction:', error);
    }
  };

  const handleAction = async (action: 'accept' | 'reject') => {
    try {
      await bidService.updateBidStatus(bid.id, action === 'accept' ? 'accepted' : 'rejected');
      addNotification('success', `Bid ${action}ed successfully!`);
      onActionTaken();
    } catch (error) {
      addNotification('error', `Failed to ${action} bid`);
    }
  };

  const handleSubmitRating = async (ratingData: RatingFormData) => {
    if (!transaction || !auth.user) return;

    try {
      await transactionService.submitRating(
        transaction.id,
        auth.user.id,
        auth.user.id === transaction.seller_id ? 'seller' : 'buyer',
        ratingData
      );
      addNotification('success', 'Rating submitted successfully!');
      setShowRatingForm(false);
      loadTransaction();
    } catch (error) {
      addNotification('error', 'Failed to submit rating');
    }
  };

  if (transaction?.status === 'completed') {
    const userType = auth.user?.id === transaction.seller_id ? 'seller' : 'buyer';
    const hasRated = userType === 'seller' 
      ? transaction.seller_rating 
      : transaction.buyer_rating;

    if (!hasRated) {
      return (
        <div className="space-y-4">
          {showRatingForm ? (
            <RatingForm
              onSubmit={handleSubmitRating}
              userType={userType}
            />
          ) : (
            <button
              onClick={() => setShowRatingForm(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Rate {userType === 'seller' ? 'Buyer' : 'Seller'}
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="text-sm text-gray-600 dark:text-gray-400">
        You have already submitted a rating
      </div>
    );
  }

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