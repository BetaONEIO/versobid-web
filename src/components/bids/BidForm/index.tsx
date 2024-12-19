import React from 'react';
import { BidFormContent } from './BidFormContent';
import { BidFormProps } from './types';

export const BidForm: React.FC<BidFormProps> = (props) => {
  return <BidFormContent {...props} />;
};