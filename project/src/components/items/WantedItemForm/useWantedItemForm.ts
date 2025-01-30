import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ItemFormData } from '../../../types/item';
import { useUser } from '../../../contexts/UserContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { itemService } from '../../../services/itemService';
import { categories } from '../../../utils/constants';

export const useWantedItemForm = () => {
  const navigate = useNavigate();
  const { auth } = useUser();
  const { addNotification } = useNotification();
  const [formData, setFormData] = useState<ItemFormData>({
    title: '',
    description: '',
    minPrice: 0,
    maxPrice: 0,
    category: categories[0],
    shipping_options: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.user) return;

    try {
      await itemService.createItem({
        ...formData,
        seller_id: auth.user.id,
        status: 'active'
      });
      addNotification('success', 'Wanted item posted successfully!');
      navigate('/listings');
    } catch (error) {
      addNotification('error', 'Failed to post wanted item');
    }
  };

  const handleChange = (field: keyof ItemFormData, value: string | number | any[]) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Ensure maxPrice is never less than minPrice
      if (field === 'minPrice' && typeof value === 'number' && value > prev.maxPrice) {
        newData.maxPrice = value;
      }

      return newData;
    });
  };

  const handleDeliveryChange = (shipping_options: ItemFormData['shipping_options']) => {
    setFormData(prev => ({ ...prev, shipping_options }));
  };

  return {
    formData,
    handleSubmit,
    handleChange,
    handleDeliveryChange
  };
};