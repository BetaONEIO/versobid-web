import { useState } from 'react';
import { useUser } from '../../../contexts/UserContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { bidService } from '../../../services/bidService';
import { Item } from '../../../types/item';

export const useBidForm = (item: Item, onBidSubmitted: () => void) => {
  const { auth } = useUser();
  const { addNotification } = useNotification();
  const [amount, setAmount] = useState<number>(item.minPrice);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.user) return;

    try {
      await bidService.createBid(item.id, amount, message);
      addNotification('success', 'Bid placed successfully!');
      onBidSubmitted();
    } catch (error) {
      addNotification('error', 'Failed to place bid');
    }
  };

  return {
    amount,
    message,
    setAmount,
    setMessage,
    handleSubmit
  };
};
