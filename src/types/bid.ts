import { Item } from './item';

export type BidStatus = 'pending' | 'accepted' | 'rejected' | 'countered';

export interface Bid {
  id: string;
  created_at: string;
  itemId: string;
  bidderId: string;
  amount: number;
  message?: string;
  shippingOption: string;
  status: BidStatus;
  item?: Item;
}

export interface BidFormData {
  amount: number;
  message: string;
  shippingOption: string;
}

export interface CreateBidParams {
  itemId: string;
  bidderId: string;
  amount: number;
  message?: string;
  shippingOption: string;
}

export interface BidServiceResponse {
  success: boolean;
  message?: string;
  bid?: Bid;
}