import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { itemService } from '../../services/itemService';
import { useNotification } from '../../contexts/NotificationContext';
import { useItemForm } from './useItemForm';

export const ItemForm: React.FC = () => {
  const navigate = useNavigate();
  const { auth } = useUser();
  const { addNotification } = useNotification();
  const { formData, handleSubmit: handleFormSubmit } = useItemForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.user) return;

    try {
      await itemService.createItem({
        title: formData.title,
        description: formData.description,
        price: formData.price,
        seller_id: auth.user.id,
        category: formData.category,
        shipping_options: formData.shipping_options,
        status: 'active'
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