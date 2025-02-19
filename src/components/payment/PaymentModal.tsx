import React from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
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

  const handlePaymentSuccess = async (transactionId: string) => {
    try {
      await paymentService.recordPayment({
        amount,
        currency: 'GBP',
        itemId,
        buyerId,
        sellerId,
        transactionId
      });

      navigate(`/payment/success?transaction_id=${transactionId}&amount=${amount}&item_title=${encodeURIComponent(itemTitle)}`);
      onClose();
    } catch (error) {
      console.error('Failed to record payment:', error);
      addNotification('error', 'Payment recorded but failed to update system. Please contact support.');
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
          {isPayPalConfigured ? (
            <PayPalButtons
              style={{ layout: "vertical" }}
              createOrder={(_, actions) => {
                return actions.order.create({
                  intent: "CAPTURE",
                  purchase_units: [{
                    amount: {
                      value: amount.toFixed(2),
                      currency_code: "GBP"
                    },
                    description: `Payment for ${itemTitle}`
                  }]
                });
              }}
              onApprove={async (_, actions) => {
                if (actions.order) {
                  const details = await actions.order.capture();
                  if (details.id) {
                    await handlePaymentSuccess(details.id);
                  }
                }
              }}
              onError={(err) => {
                console.error('PayPal error:', err);
                addNotification('error', 'Payment failed. Please try again.');
              }}
            />
          ) : (
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900 rounded-md">
              <p className="text-yellow-800 dark:text-yellow-200">
                PayPal payment is currently unavailable. Please contact support for alternative payment methods.
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};