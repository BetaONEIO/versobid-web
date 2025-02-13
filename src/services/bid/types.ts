import { Bid, BidStatus } from '../../types/bid';

export interface BidService {
  createBid: (itemId: string, amount: number, message?: string) => Promise<Bid>;
  updateBidStatus: (bidId: string, status: BidStatus, counterOffer?: number) => Promise<void>;
  getBidsForItem: (userId: string) => Promise<Bid[]>;
  getReceivedBids: (userId: string) => Promise<Bid[]>;
  respondToCounter: (bidId: string, accept: boolean) => Promise<void>;
}

export interface BidResponse {
  success: boolean;
  message: string;
  bid?: Bid;
}