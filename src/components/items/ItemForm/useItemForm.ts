import { useState } from 'react';
import { ItemFormData } from '../../../types/item';
import { categories } from '../../../utils/constants';

export const useItemForm = () => {
  const [formData, setFormData] = useState<ItemFormData>({
    title: '',
    description: '',
    minPrice: 0,
    maxPrice: 0,
    category: categories[0],
    shippingOptions: []
  });

  const handleChange = (field: keyof ItemFormData, value: string | number) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Ensure maxPrice is never less than minPrice
      if (field === 'minPrice' && typeof value === 'number' && value > prev.maxPrice) {
        newData.maxPrice = value;
      }
      
      return newData;
    });
  };

  return {
    formData,
    handleChange
  };
};