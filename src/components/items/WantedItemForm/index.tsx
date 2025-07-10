import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../contexts/UserContext';
import { useWantedItemForm } from './useWantedItemForm';
import { WantedItemFields } from './WantedItemFields';
import { PriceRangeFields } from './PriceRangeFields';
import { DeliveryOptions } from './DeliveryOptions';
import { useProfileCompletion } from '../../../hooks/useProfileCompletion';
import { ProfileCompletionBanner } from '../../profile/ProfileCompletionBanner';

export const WantedItemForm: React.FC = () => {
  const navigate = useNavigate();
  const { auth } = useUser();
  const { formData, handleSubmit, handleChange, handleDeliveryChange } = useWantedItemForm();
  const profileStatus = useProfileCompletion();

  if (!auth.user) {
    navigate('/signin');
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Post a Wanted Item</h2>
      
      {/* Profile completion banner */}
      <ProfileCompletionBanner status={profileStatus} action="list" className="mb-6" />
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <WantedItemFields 
              formData={formData} 
              onChange={handleChange}
            />
          </div>
          <div>
            <PriceRangeFields
              minPrice={formData.minPrice}
              maxPrice={formData.maxPrice}
              onChange={(field, value) => handleChange(field, value)}
            />
          </div>
        </div>

        <DeliveryOptions 
          options={formData.shippingOptions} 
          onChange={handleDeliveryChange} 
        />
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/listings')}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
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
            Post Item
          </button>
        </div>
      </form>
    </div>
  );
};