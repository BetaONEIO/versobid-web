import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../contexts/UserContext';
import { itemService } from '../../../services/itemService';
import { useNotification } from '../../../contexts/NotificationContext';
import { useItemForm } from './useItemForm';
import { ItemFormFields } from './ItemFormFields';
import { ItemPriceFields } from './ItemPriceFields';

export const ItemForm: React.FC = () => {
  const navigate = useNavigate();
  const { auth } = useUser();
  const { addNotification } = useNotification();
  const { formData, handleChange } = useItemForm();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.user) return;

    try {
      await itemService.createItem({
        ...formData,
        seller_id: auth.user.id,
        status: 'active'
      });
      addNotification('success', 'Item listed successfully!');
      navigate('/items');
    } catch (error) {
      addNotification('error', 'Failed to list item');
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <ItemFormFields formData={formData} onChange={handleChange} />
      <ItemPriceFields formData={formData} onChange={handleChange} />
      <button type="submit" className="btn-primary">
        List Item
      </button>
    </form>
  );
};