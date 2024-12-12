export type BidStatus = 'pending' | 'accepted' | 'rejected' | 'countered';

export interface Bid {
  id: string;
  itemId: string;
  bidderId: string;
  amount: number;
  message?: string;
  shippingOption: string;
  status: BidStatus;
  createdAt: string;
}

export interface BidFormData {
  amount: number;
  message?: string;
  shippingOption: string;
}