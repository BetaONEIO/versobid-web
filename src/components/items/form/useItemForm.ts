import { useState } from 'react';
import { ItemFormData, ShippingOption } from '../../../types/item';

export const useItemForm = () => {
  const [formData, setFormData] = useState<ItemFormData>({
    title: '',
    description: '',
    price: 0,
    category: 'Other',
    shipping: []
  });

  const handleChange = (field: keyof ItemFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleShippingChange = (shipping: ShippingOption[]) => {
    setFormData(prev => ({ ...prev, shipping }));
  };

  return {
    formData,
    handleChange,
    handleShippingChange
  };
};