import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { useUser } from '../contexts/UserContext';
import { formatCurrency } from '../utils/formatters';
import { PayPalButton } from '../components/payment/PayPalButton';
import { PaymentDetails } from '../services/payment/types/payment';
import { bidService } from '../services/bidService';
import { Bid } from '../types';

export const PaymentCheckout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const { auth } = useUser();
  
  //const [loading, setLoading] = useState(false);
  const [bidDetails, setBidDetails] = useState<Bid | null>(null);
  
  // Get bid info from navigation state
  const { bidId, amount } = location.state || {};

  useEffect(() => {
    const fetchBidDetails = async () => {
      if (bidId) {
        try {
          const bid = await bidService.getBid(bidId);
          setBidDetails(bid);
        } catch (error) {
          console.error('Error fetching bid details:', error);
          addNotification('error', 'Failed to load bid details');
        }
      }
    };

    fetchBidDetails();
  }, [bidId, addNotification]);

  if (!bidId || !amount || !auth.user) {
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

  const totalAmount = amount * 1.03; // 3% processing fee
  const processingFee = amount * 0.03;

  const paymentDetails: PaymentDetails = {
    amount: totalAmount,
    currency: 'USD',
    itemId: bidDetails?.item_id || '',
    buyerId: auth.user.id,
    sellerId: bidDetails?.bidder_id || '',
    transactionId: '' // Will be set by PayPal
  };

  const handlePaymentSuccess = (transactionId: string) => {
    addNotification('success', 'Payment successful!');
    navigate('/payment/success', { 
      state: { 
        bidId, 
        amount: totalAmount,
        transactionId,
        itemId: bidDetails?.item_id,
        itemTitle: bidDetails?.item?.title,
        buyerId: auth.user?.id,
        sellerId: bidDetails?.bidder_id,
        message: 'Your payment has been processed successfully!' 
      } 
    });
  };

  const handlePaymentError = (error: string) => {
    addNotification('error', error);
    navigate('/payment/failed', {
      state: {
        bidId,
        amount: totalAmount,
        itemTitle: bidDetails?.item?.title,
        error: error
      }
    });
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
                    {formatCurrency(processingFee)}
                  </span>
                </div>
                <div className="border-t border-blue-200 dark:border-blue-700 pt-2">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                      Total:
                    </span>
                    <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
                      {formatCurrency(totalAmount)}
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
                  {bidDetails && (
                    <PayPalButton
                      paymentDetails={paymentDetails}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  )}
                  {!bidDetails && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600 dark:text-gray-400">Loading payment options...</p>
                    </div>
                  )}
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
            <div className="text-gray-600 dark:text-gray-400 text-sm flex items-center">
              Secure payment powered by PayPal
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 