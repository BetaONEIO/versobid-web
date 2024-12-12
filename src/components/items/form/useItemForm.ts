import { useState } from 'react';
import { ItemFormData, ShippingOption } from '../../../types/item';
import { categories } from '../../../utils/constants';

export const useItemForm = () => {
  const [formData, setFormData] = useState<ItemFormData>({
    title: '',
    description: '',
    price: 0,
    category: categories[0],
    shipping_options: []
  });

  const handleChange = (field: keyof ItemFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleShippingChange = (shipping_options: ShippingOption[]) => {
    setFormData(prev => ({ ...prev, shipping_options }));
  };

  return {
    formData,
    handleChange,
    handleShippingChange
  };
};