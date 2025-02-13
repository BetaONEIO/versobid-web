import { ItemFormData } from '../../../types/item';

export interface PriceFieldProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  min?: number;
}

export interface ItemPriceFieldsProps {
  formData: ItemFormData;
  onChange: (field: keyof ItemFormData, value: number) => void;
}