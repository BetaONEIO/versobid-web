import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ItemFormData } from '../../types/item';
import { useUser } from '../../contexts/UserContext';
import { useNotification } from '../../contexts/NotificationContext';
import { itemService } from '../../services/itemService';
import { categories } from '../../utils/constants';
import { useProfileCompletion } from '../../hooks/useProfileCompletion';
import { ProfileCompletionBanner } from '../profile/ProfileCompletionBanner';
import { getProfileCompletionMessage } from '../../utils/profileCompletion';

export const SellerItemForm: React.FC = () => {
  const navigate = useNavigate();
  const { auth } = useUser();
  const { addNotification } = useNotification();
  const profileStatus = useProfileCompletion();
  const [formData, setFormData] = useState<ItemFormData>({
    title: '',
    description: '',
    minPrice: 0,
    maxPrice: 0,
    category: categories[0],
    shippingOptions: 'shipping'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.user) return;

    // Check profile completion for listing
    if (!profileStatus.canList) {
      const message = getProfileCompletionMessage(profileStatus, 'list');
      addNotification('error', message);
      return;
    }

    try {
      await itemService.createItem({
        ...formData,
        buyerId: auth.user.id,
        status: 'active',
        shippingOptions: 'shipping'
      });
      addNotification('success', 'Item listed successfully!');
      navigate('/listings');
    } catch (error) {
      addNotification('error', 'Failed to list item');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">List New Item</h2>
      
      {/* Profile completion banner */}
      <ProfileCompletionBanner status={profileStatus} action="list" className="mb-6" />
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Title
          </label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            required
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Minimum Price (£)
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.minPrice}
              onChange={(e) => setFormData({ ...formData, minPrice: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Maximum Price (£)
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.maxPrice}
              onChange={(e) => setFormData({ ...formData, maxPrice: Number(e.target.value) })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category
          </label>
          <select
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/listings')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 ${
              !profileStatus.canList ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!profileStatus.canList}
          >
            List Item
          </button>
        </div>
      </form>
    </div>
  );
};