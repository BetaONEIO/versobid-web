import React from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { useNotification } from '../../contexts/NotificationContext';
import { PaymentDetails } from '../../types/payment';
import { paymentService } from '../../services/payment/paymentService';

interface PayPalButtonProps {
  paymentDetails: PaymentDetails;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
}

export const PayPalButton: React.FC<PayPalButtonProps> = ({
  paymentDetails,
  onSuccess,
  onError,
}) => {
  const [{ isPending }] = usePayPalScriptReducer();
  const { addNotification } = useNotification();

  if (isPending) {
    return <div>Loading PayPal...</div>;
  }

  return (
    <PayPalButtons
      style={{ layout: "vertical" }}
      createOrder={async () => {
        try {
          const order = await paymentService.createPayPalOrder(paymentDetails);
          return order.id;
        } catch (error) {
          onError('Failed to create PayPal order');
          return '';
        }
      }}
      onApprove={async (_, actions) => {
        try {
          const details = await actions.order?.capture();
          if (details?.id) {
            onSuccess(details.id);
            addNotification('success', 'Payment completed successfully!');
          }
        } catch (error) {
          onError('Payment failed');
          addNotification('error', 'Payment failed. Please try again.');
        }
      }}
      onError={() => {
        onError('Payment failed');
        addNotification('error', 'Payment failed. Please try again.');
      }}
    />
  );
};