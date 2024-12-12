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
        ...formData,
        sellerId: auth.user.id
      });
      addNotification('success', 'Item listed successfully!');
      navigate('/items');
    } catch (error) {
      addNotification('error', 'Failed to list item');
    }
  };

  const handleShippingChange = (index: number, field: keyof ShippingOption, value: string | number) => {
    const newShipping = [...formData.shipping];
    newShipping[index] = { ...newShipping[index], [field]: value };
    setFormData({ ...formData, shipping: newShipping });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic item details */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Price</label>
        <input
          type="number"
          required
          min="0"
          step="0.01"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
        />
      </div>

      {/* Shipping options */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Shipping Options</h3>
        
        {/* Shipping */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Shipping Cost</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            value={formData.shipping[0].cost}
            onChange={(e) => handleShippingChange(0, 'cost', Number(e.target.value))}
          />
        </div>

        {/* Pickup */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Pickup Location</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            value={formData.shipping[1].location}
            onChange={(e) => handleShippingChange(1, 'location', e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => navigate('/items')}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md"
        >
          Cancel
        </button>
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