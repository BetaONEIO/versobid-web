import { useState } from 'react';
import { useUser } from '../../../contexts/UserContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { bidService } from '../../../services/bidService';
import { BidFormData, BidServiceResponse } from '../../../types/bid';
import { Item } from '../../../types/item';

export const useBidForm = (item: Item, onBidSubmitted: () => void) => {
  const { auth } = useUser();
  const { addNotification } = useNotification();

  const [formData, setFormData] = useState<BidFormData>({
    amount: item.price,
    message: '',
    shippingOption: item.shipping_options[0]?.type || 'shipping',
  });

  const handleChange = (field: keyof BidFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth.user) {
      addNotification('error', 'You must be logged in to place a bid.');
      return;
    }

    try {
      const response: BidServiceResponse = await bidService.createBid({
        itemId: item.id,
        bidderId: auth.user.id,
        amount: formData.amount,
        message: formData.message,
        shippingOption: formData.shippingOption,
      });

      if (!response.success) {
        addNotification('error', response.message || 'Failed to place bid.');
        return;
      }

      addNotification('success', 'Bid placed successfully!');
      onBidSubmitted();
    } catch (error) {
      console.error('Error placing bid:', error);
      addNotification('error', 'An unexpected error occurred.');
    }
  };

  return {
    formData,
    handleSubmit,
    handleChange,
  };
};