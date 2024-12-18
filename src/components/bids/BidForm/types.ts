import { BidFormData } from '../../../types/bid';
import { Item } from '../../../types/item';

export interface ItemFormFieldsProps {
  formData: BidFormData;
  onChange: (field: keyof BidFormData, value: string | number) => void;
}

export interface ItemPriceFieldsProps {
  formData: BidFormData;
  onPriceChange: (value: number) => void;
}

export interface BidFormProps {
  item: Item;
  onBidSubmitted: () => void;
}

export interface BidFormContentProps extends BidFormProps {
  formData: BidFormData;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (field: keyof BidFormData, value: string | number) => void;
}