import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '../utils/formatters';

export const PaymentFailed: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useNotification();

  // Get data from location state
  const stateData = location.state;
  const bidId = stateData?.bidId;
  const amount = stateData?.amount;
  const error = stateData?.error || 'Payment processing failed';
  const itemTitle = stateData?.itemTitle;

  useEffect(() => {
    if (!bidId || !amount) {
      addNotification('error', 'Invalid payment session');
      navigate('/bids');
    }
  }, [bidId, amount, navigate, addNotification]);

  const handleRetryPayment = () => {
    if (bidId && amount) {
      navigate('/payment/checkout', { 
        state: { 
          bidId, 
          amount,
          itemTitle
        } 
      });
    }
  };

  const handleViewBids = () => {
    navigate('/bids');
  };

  const handleContactSupport = () => {
    // You can implement support contact logic here
    addNotification('info', 'Please contact support at support@yourapp.com');
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900">
          <XCircleIcon className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>
        
        <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
          Payment Failed
        </h2>
        
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          {error}
        </p>
        
        {itemTitle && (
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Payment for {itemTitle} could not be processed
          </p>
        )}
        
        {amount && (
          <p className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
            Amount: {formatCurrency(parseFloat(amount.toString()))}
          </p>
        )}

        <div className="mt-8 space-y-3">
          <button
            onClick={handleRetryPayment}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 flex items-center justify-center"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Try Payment Again
          </button>
          
          <button
            onClick={handleViewBids}
            className="w-full px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
          >
            Back to Bids
          </button>

          <button
            onClick={handleContactSupport}
            className="w-full px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            Contact Support
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Your bid is still active. You can try payment again or contact support for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}; 