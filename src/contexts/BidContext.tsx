import { Bid } from "../types";

export interface BidState {
  currentBid: Bid | null;
  negotiationHistory: Bid[];
  paymentStatus: 'pending' | 'completed' | 'rejected';
}

