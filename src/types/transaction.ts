export interface Transaction {
  id: string;
  bid_id: string;
  seller_id: string;
  buyer_id: string;
  item_id: string;
  status: 'pending' | 'shipped' | 'completed';
  shipping_date?: string;
  delivery_date?: string;
  created_at: string;
  seller_rating?: Rating;
  buyer_rating?: Rating;
}

export interface Rating {
  rating: number;
  comment: string;
  created_at: string;
}

export interface RatingFormData {
  rating: number;
  comment: string;
}