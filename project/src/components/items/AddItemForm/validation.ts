import { ItemFormData } from '../../../types/item';

export const validateItemForm = (formData: ItemFormData) => {
  const errors: Partial<Record<keyof ItemFormData, string>> = {};

  if (!formData.title.trim()) {
    errors.title = 'Title is required';
  }

  if (!formData.description.trim()) {
    errors.description = 'Description is required';
  }

  if (formData.minPrice <= 0) {
    errors.minPrice = 'Minimum price must be greater than 0';
  }

  if (formData.maxPrice <= formData.minPrice) {
    errors.maxPrice = 'Maximum price must be greater than minimum price';
  }

  return errors;
};