import { Bid } from '../../types/bid';

export interface BidServiceResponse {
  success: boolean;
  message: string;
  bid?: Bid;
}

export interface CreateBidParams {
  itemId: string;
  bidderId: string;
  amount: number;
  message?: string;
  shippingOption: string;
}

export interface UpdateBidStatusParams {
  bidId: string;
  status: 'accepted' | 'rejected' | 'countered';
}