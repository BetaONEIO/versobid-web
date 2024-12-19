import { Bid, BidStatus } from '../../types/bid';

export interface CreateBidParams {
  itemId: string;
  bidderId: string;
  amount: number;
  message?: string;
  shippingOption: string;
}

export interface UpdateBidStatusParams {
  bidId: string;
  status: BidStatus;
}

export interface BidServiceResponse {
  success: boolean;
  message: string;
  bid?: Bid;
}