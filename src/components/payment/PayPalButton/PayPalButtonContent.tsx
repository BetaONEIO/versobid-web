import React from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { useNotification } from '../../../contexts/NotificationContext';
import { PayPalButtonProps } from './types';

export const PayPalButtonContent: React.FC<PayPalButtonProps> = ({
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
      //@ts-ignore
      createOrder={(data, actions) => {
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                currency_code: paymentDetails.currency,
                value: paymentDetails.amount.toFixed(2),
              },
              description: `Payment for bid - Item ID: ${paymentDetails.itemId}`,
            },
          ],
          intent: "CAPTURE",
        });
      }}
      //@ts-ignore
      onApprove={async (data, actions) => {
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