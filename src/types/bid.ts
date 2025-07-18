export type BidStatus = 'pending' | 'accepted' | 'rejected' | 'countered' | 'confirmed';

export interface Bid {
  id: string;
  item_id: string;
  bidder_id: string;
  amount: number;
  counter_amount?: number;
  message?: string | null;
  status: BidStatus;
  created_at: string;
  bidder?: {
    username: string;
  };
  shipping_address?: {
    city: string;
    country: string;
    postcode: string;
    street: string;
  };
  item?: {
    id: string;
    title: string;
    description?: string;
    minPrice: number;
    maxPrice: number;
    seller_id: string;
    buyer_id: string;
    category: string;
    status: string;
    created_at: string;
    shippingOptions?: 'shipping' | 'seller-pickup';
  };
}