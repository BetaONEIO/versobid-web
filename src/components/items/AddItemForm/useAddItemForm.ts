import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ItemFormData } from '../../../types/item';
import { categories } from '../../../utils/constants';

export const useAddItemForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ItemFormData>({
    title: '',
    description: '',
    price: 0,
    category: categories[0],
    shipping: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting item:', formData);
    navigate('/bids');
  };

  const handlePriceChange = (value: number) => {
    setFormData(prev => ({
      ...prev,
      price: value
    }));
  };

  const handleInputChange = (field: keyof ItemFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    handleSubmit,
    handlePriceChange,
    handleInputChange,
  };
};