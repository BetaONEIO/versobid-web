```typescript
import { BidFormData } from '../../../types/bid';

export interface BidFormProps {
  formData: BidFormData;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (field: keyof BidFormData, value: string | number) => void;
}

export interface BidFormContentProps {
  formData: BidFormData;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (field: keyof BidFormData, value: string | number) => void;
}

export interface ItemPriceFieldsProps {
  formData: BidFormData;
  onChange: (field: keyof BidFormData, value: number) => void;
}
```