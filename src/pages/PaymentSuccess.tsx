import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '../utils/formatters';
import { paymentService } from '../services/payment/paymentService';
import { PaymentDetails } from '../services/payment/types/payment';

export const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { addNotification } = useNotification();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);

  // Try to get data from location.state first (new flow), then fallback to searchParams (old flow)
  const stateData = location.state;
  const transactionId = stateData?.transactionId || searchParams.get('transaction_id');
  const amount = stateData?.amount || searchParams.get('amount');
  const bidId = stateData?.bidId;
  const itemTitle = stateData?.itemTitle || searchParams.get('item_title');
  const message = stateData?.message;

  useEffect(() => {
    if (!transactionId) {
      addNotification('error', 'Invalid payment session');
      navigate('/bids');
      return;
    }

    // Record payment in database if we have complete payment details
    const recordPayment = async () => {
      if (stateData && bidId && !isRecording && !recordingComplete) {
        setIsRecording(true);
        try {
          const paymentDetails: PaymentDetails = {
            amount: amount,
            currency: 'USD',
            itemId: stateData.itemId || '',
            buyerId: stateData.buyerId || '',
            sellerId: stateData.sellerId || '',
            transactionId: transactionId
          };
          
          await paymentService.recordPayment(paymentDetails);
          addNotification('success', 'Payment recorded successfully');
          setRecordingComplete(true);
        } catch (error) {
          console.error('Error recording payment:', error);
          // Don't show error to user since payment was successful
        } finally {
          setIsRecording(false);
        }
      }
    };

    recordPayment();
  }, [transactionId, bidId]); // Only depend on essential data that doesn't change

  const handleViewBids = () => {
    navigate('/bids');
  };

  const handleViewBidDetails = () => {
    if (bidId) {
      navigate(`/bids/${bidId}`);
    } else {
      navigate('/bids');
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900">
          <CheckCircleIcon className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        
        <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
          Payment Successful!
        </h2>
        
        {message && (
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {message}
          </p>
        )}
        
        {itemTitle && (
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Payment for {itemTitle} has been completed
          </p>
        )}
        
        {amount && (
          <p className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
            Amount paid: {formatCurrency(parseFloat(amount.toString()))}
          </p>
        )}
        
        {transactionId && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Transaction ID: {transactionId}
          </p>
        )}

        {isRecording && (
          <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
            Recording payment...
          </p>
        )}

        <div className="mt-8 space-y-3">
          {bidId ? (
            <button
              onClick={handleViewBidDetails}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              View Bid Details
            </button>
          ) : null}
          
          <button
            onClick={handleViewBids}
            className="w-full px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
          >
            View All Bids
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            The seller will be notified about your payment and will prepare your item for shipping.
          </p>
        </div>
      </div>
    </div>
  );
};