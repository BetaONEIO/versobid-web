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
    handleChange
  };
};