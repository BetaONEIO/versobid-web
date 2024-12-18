import React from 'react';
import { BidFormContent } from './BidFormContent';
import { BidFormProps } from './types';
import { useBidForm } from './useBidForm';

export const BidForm: React.FC<BidFormProps> = ({ item, onBidSubmitted }) => {
  const { formData, handleSubmit, handleChange } = useBidForm(item, onBidSubmitted);

  return (
    <BidFormContent
      item={item}
      formData={formData}
      onSubmit={handleSubmit}
      onChange={handleChange}
      onBidSubmitted={onBidSubmitted}
    />
  );
};