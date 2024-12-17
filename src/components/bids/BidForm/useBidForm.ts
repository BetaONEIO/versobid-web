import { useState } from 'react';
import { useUser } from '../../../contexts/UserContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { bidService } from '../../../services/bidService';
import { BidFormData } from '../../../types/bid';
import { Item } from '../../../types/item';

export const useBidForm = (item: Item, onBidSubmitted: () => void) => {
  const { auth } = useUser();
  const { addNotification } = useNotification();

  // Initialize form data
  const [formData, setFormData] = useState<BidFormData>({
    amount: item.price,
    message: '',
    shippingOption: item.shipping_options[0]?.type || 'shipping',
  });

  // Handle input field changes
  const handleChange = (field: keyof BidFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth.user) {
      addNotification('error', 'You must be logged in to place a bid.');
      return;
    }

    try {
      // Call the bidService to create a bid
      const response = await bidService.createBid({
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