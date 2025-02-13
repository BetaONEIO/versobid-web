import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ItemFormFields } from './ItemFormFields';
import { ItemPriceFields } from './ItemPriceFields';
import { FormActions } from './FormActions';
import { useAddItemForm } from './useAddItemForm';

export const AddItemForm: React.FC = () => {
  const navigate = useNavigate();
  const { formData, handleChange } = useAddItemForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    navigate('/items');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add New Item</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <ItemFormFields 
          formData={formData} 
          onChange={handleChange} 
        />
        <ItemPriceFields 
          formData={formData} 
          onChange={handleChange} 
        />
        <FormActions 
          onCancel={() => navigate('/items')}
          isSubmitting={false}
        />
      </form>
    </div>
  );
};