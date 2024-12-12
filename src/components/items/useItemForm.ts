import { useState } from 'react';
import { ItemFormData } from '../../types/item';

export const useItemForm = () => {
  const [formData, setFormData] = useState<ItemFormData>({
    title: '',
    description: '',
    price: 0,
    category: 'Other',
    shipping: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic
  };

  return {
    formData,
    handleSubmit
  };
};