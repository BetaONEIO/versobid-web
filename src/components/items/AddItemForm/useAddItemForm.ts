```typescript
import { useState } from 'react';
import { ItemFormData } from '../../../types/item';
import { categories } from '../../../utils/constants';

export const useAddItemForm = () => {
  const [formData, setFormData] = useState<ItemFormData>({
    title: '',
    description: '',
    price: 0,
    category: categories[0],
    shipping_options: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handlePriceChange = (value: number) => {
    setFormData((prev: ItemFormData) => ({
      ...prev,
      price: value
    }));
  };

  const handleInputChange = (field: keyof ItemFormData, value: string | number) => {
    setFormData((prev: ItemFormData) => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    handleSubmit,
    handlePriceChange,
    handleInputChange
  };
};
```