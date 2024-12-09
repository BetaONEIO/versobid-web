import React from 'react';
import { ItemFormFields } from './ItemFormFields';
import { ItemPriceFields } from './ItemPriceFields';
import { FormActions } from './FormActions';
import { useAddItemForm } from './useAddItemForm';

export const AddItemForm: React.FC = () => {
  const { formData, handleSubmit, handlePriceChange, handleInputChange } = useAddItemForm();

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add New Item</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <ItemFormFields 
          formData={formData} 
          onChange={handleInputChange} 
        />
        <ItemPriceFields 
          formData={formData} 
          onPriceChange={handlePriceChange} 
        />
        <FormActions />
      </form>
    </div>
  );
};