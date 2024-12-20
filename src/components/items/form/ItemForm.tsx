import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../contexts/UserContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { itemService } from '../../../services/itemService';
import { useItemForm } from './useItemForm';
import { ItemFormFields } from './ItemFormFields';
import { ItemPriceFields } from './ItemPriceFields';
import { ItemShippingFields } from './ItemShippingFields';

export const ItemForm: React.FC = () => {
  const navigate = useNavigate();
  const { auth } = useUser();
  const { addNotification } = useNotification();
  const { formData, handleChange, handleShippingChange } = useItemForm();

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
      <ItemFormFields formData={formData} onChange={handleChange} />
      <ItemPriceFields formData={formData} onChange={handleChange} />
      <ItemShippingFields formData={formData} onShippingChange={handleShippingChange} />
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          List Item
        </button>
      </div>
    </form>
  );
};