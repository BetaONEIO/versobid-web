import { ItemFormData } from '../../../types/item';

export interface UseItemFormReturn {
  formData: ItemFormData;
  handleSubmit: (e: React.FormEvent) => void;
  handleChange: (field: keyof ItemFormData, value: any) => void;
}