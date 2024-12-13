```typescript
import { ItemFormData } from '../../../types/item';

export interface ItemFormFieldsProps {
  formData: ItemFormData;
  onChange: (field: keyof ItemFormData, value: string | number) => void;
}

export interface ItemPriceFieldsProps {
  formData: ItemFormData;
  onPriceChange: (value: number) => void;
}

export interface FormActionsProps {
  onCancel: () => void;
  isSubmitting?: boolean;
}
```