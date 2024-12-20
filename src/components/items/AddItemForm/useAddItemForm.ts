import { useState } from 'react';
import { ItemFormData } from './types';
import { categories } from '../../../utils/constants';

export const useAddItemForm = () => {
  const [formData, setFormData] = useState<ItemFormData>({
    title: '',
    description: '',
    price: 0,
    category: categories[0]
  });

  const handleChange = (field: keyof ItemFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    handleChange,
    handleSubmit: () => { /* Add submit logic here */ },
    handlePriceChange: (field:keyof ItemFormData, value: number) => handleChange(field, value),
    handleInputChange: (field: keyof ItemFormData, value: string|number) => handleChange(field, value)

  };
};
