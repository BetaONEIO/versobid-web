import React from 'react';
import { BidAmountField } from './BidAmountField';
import { BidMessageField } from './BidMessageField';
import { ShippingOptionField } from './ShippingOptionField';
import { useBidForm } from './useBidForm';
import { BidFormProps } from './types';

export const BidFormContent: React.FC<BidFormProps> = ({ item, onBidSubmitted }) => {
  const { formData, handleSubmit, handleChange } = useBidForm(item, onBidSubmitted);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <BidAmountField 
        amount={formData.amount}
        onChange={(value) => handleChange('amount', value)}
      />
      
      <BidMessageField
        message={formData.message}
        onChange={(value) => handleChange('message', value)}
      />
      
      <ShippingOptionField
        selectedOption={formData.shippingOption}
        options={item.shipping_options}
        onChange={(value) => handleChange('shippingOption', value)}
      />

      <button
        type="submit"
        className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
      >
        Place Bid
      </button>
    </form>
  );
};