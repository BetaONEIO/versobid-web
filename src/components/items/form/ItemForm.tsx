import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../contexts/UserContext';
import { itemService } from '../../../services/itemService';
import { useNotification } from '../../../contexts/NotificationContext';
import { useItemForm } from './useItemForm';
import { ItemFormFields } from './ItemFormFields';
import { ItemPriceFields } from './ItemPriceFields';
import { useProfileCompletion } from '../../../hooks/useProfileCompletion';
import { ProfileCompletionBanner } from '../../profile/ProfileCompletionBanner';
import { getProfileCompletionMessage } from '../../../utils/profileCompletion';

export const ItemForm: React.FC = () => {
  const navigate = useNavigate();
  const { auth } = useUser();
  const { addNotification } = useNotification();
  const { formData, handleChange } = useItemForm();
  const profileStatus = useProfileCompletion();

  const onSubmit = async (e: React.FormEvent) => {
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
        status: 'active'
      });
      addNotification('success', 'Item listed successfully!');
      navigate('/items');
    } catch (error) {
      addNotification('error', 'Failed to list item');
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile completion banner */}
      <ProfileCompletionBanner status={profileStatus} action="list" />
      
      <form onSubmit={onSubmit} className="space-y-6">
        <ItemFormFields formData={formData} onChange={handleChange} />
        <ItemPriceFields formData={formData} onChange={handleChange} />
        <button 
          type="submit" 
          className={`btn-primary ${!profileStatus.canList ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!profileStatus.canList}
        >
          List Item
        </button>
      </form>
    </div>
  );
};