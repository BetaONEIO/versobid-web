import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ItemFormData } from '../../types';
import { categories } from '../../utils/constants';

export const useAddItemForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ItemFormData>({
    title: '',
    description: '',
    category: categories[0],
    minPrice: 0,
    maxPrice: 0,
    duration: 7,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const medianPrice = (formData.minPrice + formData.maxPrice) / 2;
    console.log('Submitting item:', { ...formData, medianPrice });
    navigate('/bids');
  };

  const handlePriceChange = (field: 'minPrice' | 'maxPrice', value: number) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'maxPrice' && value < prev.minPrice) {
        newData.maxPrice = prev.minPrice;
      }
      if (field === 'minPrice' && value > prev.maxPrice) {
        newData.minPrice = prev.maxPrice;
      }
      return newData;
    });
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