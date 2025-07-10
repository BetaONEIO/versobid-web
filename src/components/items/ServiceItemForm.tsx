import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { useNotification } from '../../contexts/NotificationContext';
import { itemService } from '../../services/itemService';
import { useProfileCompletion } from '../../hooks/useProfileCompletion';
import { ProfileCompletionBanner } from '../profile/ProfileCompletionBanner';
import { getProfileCompletionMessage } from '../../utils/profileCompletion';

interface ServiceFormData {
  title: string;
  description: string;
  category: string;
  rateType: 'hourly' | 'fixed' | 'project';
  rate: number;
  availability: string;
  location: string;
  remote: boolean;
}

const categories = [
  'Web Development',
  'Design',
  'Writing',
  'Translation',
  'Marketing',
  'Business',
  'Legal',
  'Teaching',
  'Other'
];

export const ServiceItemForm: React.FC = () => {
  const navigate = useNavigate();
  const { auth } = useUser();
  const { addNotification } = useNotification();
  const profileStatus = useProfileCompletion();
  const [formData, setFormData] = useState<ServiceFormData>({
    title: '',
    description: '',
    category: categories[0],
    rateType: 'hourly',
    rate: 0,
    availability: '',
    location: '',
    remote: true
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
        title: formData.title,
        description: formData.description,
        category: formData.category,
        buyerId: auth.user.id,
        minPrice: formData.rate,
        maxPrice: formData.rate,
        status: 'active',
        shippingOptions: 'shipping',
        type: 'service',
        serviceDetails: {
          rateType: formData.rateType,
          availability: formData.availability,
          location: formData.location,
          remote: formData.remote
        }
      });
      addNotification('success', 'Service listed successfully!');
      navigate('/listings');
    } catch (error) {
      addNotification('error', 'Failed to list service');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">List New Service</h2>
      
      {/* Profile completion banner */}
      <ProfileCompletionBanner status={profileStatus} action="list" className="mb-6" />
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Service Title
          </label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
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
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category
          </label>
          <select
            required
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Rate Type
            </label>
            <select
              required
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              value={formData.rateType}
              onChange={(e) => setFormData({ ...formData, rateType: e.target.value as 'hourly' | 'fixed' | 'project' })}
            >
              <option value="hourly">Hourly</option>
              <option value="fixed">Fixed Price</option>
              <option value="project">Per Project</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Rate (£{formData.rateType === 'hourly' ? '/hour' : formData.rateType === 'project' ? '/project' : ''}
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              value={formData.rate}
              onChange={(e) => setFormData({ ...formData, rate: Number(e.target.value) })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Availability
          </label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="e.g., Weekdays 9-5, Flexible hours"
            value={formData.availability}
            onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Location
          </label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="e.g., London, UK"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="remote"
            checked={formData.remote}
            onChange={(e) => setFormData({ ...formData, remote: e.target.checked })}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="remote" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Available for remote work
          </label>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/listings')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
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
            List Service
          </button>
        </div>
      </form>
    </div>
  );
};