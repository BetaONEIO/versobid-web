import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ItemFormData } from '../../types/item';
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
    shipping: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.user) return;

    try {
      await itemService.createItem({
        ...formData,
        seller_id: auth.user.id,
      });
      addNotification('success', 'Item listed successfully!');
      navigate('/items');
    } catch (error) {
      addNotification('error', 'Failed to list item');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form fields implementation */}
      <button type="submit" className="btn-primary">
        List Item
      </button>
    </form>
  );
};