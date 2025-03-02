import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import { Modal } from '../ui/Modal';
import { formatCurrency } from '../../utils/formatters';
import { paymentService } from '../../services/paymentService';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  itemTitle: string;
  itemId: string;
  sellerId: string;
  buyerId: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  itemTitle,
  itemId,
  sellerId,
  buyerId
}) => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  // Check if PayPal is configured
  const isPayPalConfigured = !!import.meta.env.VITE_PAYPAL_CLIENT_ID;

  const handlePayment = async () => {
    try {
      await paymentService.recordPayment({
        amount,
        currency: 'GBP',
        itemId,
        buyerId,
        sellerId,
        transactionId: `manual-${Date.now()}`
      });
      
      navigate(`/payment/success?amount=${amount}&item_title=${encodeURIComponent(itemTitle)}`);
      onClose();
    } catch (error) {
      addNotification('error', 'Payment failed. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Payment">
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Payment for {itemTitle}
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Total amount: {formatCurrency(amount)}
          </p>
        </div>

        <div className="mt-4">
          {!isPayPalConfigured ? (
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900 rounded-md">
              <p className="text-yellow-800 dark:text-yellow-200 mb-4">
                PayPal payment is currently unavailable.
              </p>
              <button
                onClick={handlePayment}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Process Manual Payment
              </button>
            </div>
          ) : (
            <div className="text-center p-4">
              <p className="text-gray-600 dark:text-gray-400">
                PayPal integration temporarily disabled. Please check back later.
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};