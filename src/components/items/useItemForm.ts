import { useState } from 'react';
import { ItemFormData } from '../../types/item';
import { categories } from '../../utils/constants';

export const useItemForm = () => {
  const [formData, setFormData] = useState<ItemFormData>({
    title: '',
    description: '',
    price: 0,
    category: categories[0],
    shipping_options: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic handled by parent component
  };

  const handleChange = (field: keyof ItemFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    handleSubmit,
    handleChange
  };
};