import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addNotification } = useNotification();
  const transactionId = searchParams.get('transaction_id');
  const amount = searchParams.get('amount');
  const itemTitle = searchParams.get('item_title');

  useEffect(() => {
    if (!transactionId) {
      addNotification('error', 'Invalid payment session');
      navigate('/listings');
    }
  }, [transactionId, navigate, addNotification]);

  const handleContinue = () => {
    navigate('/listings');
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
        
        {itemTitle && (
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Payment for {itemTitle} has been completed
          </p>
        )}
        
        {amount && (
          <p className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
            Amount paid: £{parseFloat(amount).toFixed(2)}
          </p>
        )}
        
        {transactionId && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Transaction ID: {transactionId}
          </p>
        )}

        <div className="mt-8 space-y-4">
          <button
            onClick={handleContinue}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};