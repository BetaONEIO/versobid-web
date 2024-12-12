import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ItemFormData, ShippingOption } from '../../types/item';
import { useUser } from '../../contexts/UserContext';
import { itemService } from '../../services/itemService';
import { useNotification } from '../../contexts/NotificationContext';

export const ItemForm: React.FC = () => {
  const navigate = useNavigate();
  const { auth } = useUser();
  const { addNotification } = useNotification();
  const [formData, setFormData] = useState<ItemFormData>({
    title: '',
    description: '',
    price: 0,
    category: 'Other',
    shipping: [
      { type: 'shipping', cost: 0 },
      { type: 'pickup', location: '' }
    ]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.user) return;

    try {
      await itemService.createItem({
        title: formData.title,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        seller_id: auth.user.id,
        shipping_options: formData.shipping
      });
      addNotification('success', 'Item listed successfully!');
      navigate('/items');
    } catch (error) {
      addNotification('error', 'Failed to list item');
    }
  };

  // Rest of the component remains the same
};