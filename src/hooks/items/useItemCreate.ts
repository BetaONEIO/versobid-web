import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ItemFormData } from '../../types/item';
import { itemService } from '../../services/itemService';
import { useUser } from '../../contexts/UserContext';
import { useNotification } from '../../contexts/NotificationContext';

export const useItemCreate = () => {
  const navigate = useNavigate();
  const { auth } = useUser();
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createItem = async (formData: ItemFormData) => {
    if (!auth.user) return;
    
    setLoading(true);
    setError(null);

    try {
      await itemService.createItem({
        ...formData,
        sellerId: auth.user.id,
        status: 'active'
      });
      addNotification('success', 'Item listed successfully!');
      navigate('/listings');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create item';
      setError(message);
      addNotification('error', message);
    } finally {
      setLoading(false);
    }
  };

  return { createItem, loading, error };
};