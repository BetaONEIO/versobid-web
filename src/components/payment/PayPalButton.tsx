import React from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { useNotification } from '../../contexts/NotificationContext';
import { PaymentDetails } from '../../services/payment/types/payment';
import { paymentService } from '../../services/paymentService';
import { bidService } from '../../services/bidService';

interface PayPalButtonProps {
  paymentDetails: PaymentDetails;
  bidId: string;
  amount: number;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
}

export const PayPalButton: React.FC<PayPalButtonProps> = ({
  //@ts-ignore
  paymentDetails,
  bidId,
  amount,
  onSuccess,
  onError,
}) => {
  const [{ isPending }] = usePayPalScriptReducer();
  const { addNotification } = useNotification();

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading PayPal...</span>
      </div>
    );
  }

  return (
    <PayPalButtons
      style={{ layout: "vertical" }}
      createOrder={async () => {
        try {
          const response = await paymentService.createPayPalOrder({
            bidId,
            amount
          });
          return response.orderId;
        } catch (error) {
          console.error('Error creating PayPal order:', error);
          onError('Failed to create payment order');
          throw error;
        }
      }}
      onApprove={async (data) => {
        try {
          const response = await paymentService.capturePayPalOrder({
            orderId: data.orderID
          });
          
          if (response.success && response.captureId) {
            await bidService.updateBidStatus(bidId, 'confirmed');
            
            onSuccess(response.captureId);
            addNotification('success', 'Payment completed successfully!');
          } else {
            throw new Error('Payment capture failed');
          }
        } catch (error) {
          console.error('Error capturing PayPal order:', error);
          onError('Payment capture failed');
          addNotification('error', 'Payment failed. Please try again.');
        }
      }}
      onError={(error) => {
        console.error('PayPal button error:', error);
        onError('Payment failed');
        addNotification('error', 'Payment failed. Please try again.');
      }}
      onCancel={() => {
        addNotification('info', 'Payment cancelled');
      }}
    />
  );
};