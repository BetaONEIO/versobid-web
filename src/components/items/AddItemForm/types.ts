export interface FormActionsProps {
  onCancel: () => void;
  isSubmitting?: boolean;
}

export interface ItemFormData {
  title: string;
  description: string;
  price: number;
  category: string;
}

export interface ItemFormFieldsProps {
  formData: ItemFormData;
  onChange: (field: keyof ItemFormData, value: string | number) => void;
}

export interface ItemPriceFieldsProps {
  formData: ItemFormData;
  onChange: (field: keyof ItemFormData, value: number) => void;
}