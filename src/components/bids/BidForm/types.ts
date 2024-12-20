import { Item } from '../../../types/item';

export interface BidFormProps {
  item: Item;
  onBidSubmitted: () => void;
}

export interface BidFormState {
  amount: number;
  message: string;
  shippingOption: string;
}