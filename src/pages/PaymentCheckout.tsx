import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { formatCurrency } from '../utils/formatters';

export const PaymentCheckout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  
  const [loading, setLoading] = useState(false);
  
  // Get bid info from navigation state
  const { bidId, amount } = location.state || {};

  if (!bidId || !amount) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Invalid payment session. Please try again.
          </p>
          <button
            onClick={() => navigate('/bids')}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
          >
            Go Back to Bids
          </button>
        </div>
      </div>
    );
  }

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      addNotification('success', 'Payment successful!');
      navigate('/payment/success', { 
        state: { 
          bidId, 
          amount,
          message: 'Your payment has been processed successfully!' 
        } 
      });
    } catch (error) {
      console.error('Payment failed:', error);
      addNotification('error', 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Payment Checkout
            </h1>
          </div>

          <div className="p-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
                Payment Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">Bid Amount:</span>
                  <span className="font-semibold text-blue-900 dark:text-blue-100">
                    {formatCurrency(amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">Processing Fee:</span>
                  <span className="font-semibold text-blue-900 dark:text-blue-100">
                    {formatCurrency(amount * 0.03)}
                  </span>
                </div>
                <div className="border-t border-blue-200 dark:border-blue-700 pt-2">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                      Total:
                    </span>
                    <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
                      {formatCurrency(amount * 1.03)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Payment Method
                </h4>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          CVV
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Name on Card
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-between">
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                `Pay ${formatCurrency(amount * 1.03)}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 