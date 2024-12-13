import { useState } from 'react';
import { useUser } from '../../../contexts/UserContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { bidService } from '../../../services/bidService';
import { Item } from '../../../types/item';
import { BidFormState } from './types';

export const useBidForm = (item: Item, onBidSubmitted: () => void) => {
  const { auth } = useUser();
  const { addNotification } = useNotification();
  const [formData, setFormData] = useState<BidFormState>({
    amount: item.price,
    message: '',
    shippingOption: item.shipping_options[0]?.type || 'shipping'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.user) return;

    try {
      await bidService.createBid({
        itemId: item.id,
        bidderId: auth.user.id,
        ...formData
      });
      addNotification('success', 'Bid placed successfully!');
      onBidSubmitted();
    } catch (error) {
      addNotification('error', 'Failed to place bid');
    }
  };

  const handleChange = (field: keyof BidFormState, value: string | number) => {
    setFormData((prev: BidFormState) => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    handleSubmit,
    handleChange
  };
};