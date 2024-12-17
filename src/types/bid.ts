```typescript
// Status options for bids
export type BidStatus = 'pending' | 'accepted' | 'rejected' | 'countered';

// Shape of a single bid
export interface Bid {
  id: string;
  created_at: string;
  itemId: string;
  bidderId: string;
  amount: number;
  message?: string;
  shippingOption: string;
  status: BidStatus;
}

// Form data for creating or editing a bid
export interface BidFormData {
  amount: number;
  message: string;
  shippingOption: string;
}

// Service response types
export interface BidServiceResponse {
  success: boolean;
  message?: string;
  bid?: Bid;
}

export interface CreateBidParams {
  itemId: string;
  bidderId: string;
  amount: number;
  message?: string;
  shippingOption: string;
}
```