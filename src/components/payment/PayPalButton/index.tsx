import React from 'react';
import { PayPalButtonContent } from './PayPalButtonContent';
import { PayPalButtonProps } from './types';

export const PayPalButton: React.FC<PayPalButtonProps> = (props) => {
  return <PayPalButtonContent {...props} />;
};