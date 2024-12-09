export interface Item {
  id: string;
  title: string;
  description: string;
  targetPrice: number;
  buyerId: string;
  category: string;
  createdAt: Date;
  imageUrl?: string;
  status: 'open' | 'closed';
  bids: Bid[];
}

export interface Bid {
  id: string;
  itemId: string;
  sellerId: string;
  amount: number;
  createdAt: Date;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface User {
  id: string;
  role: 'buyer' | 'seller' | 'admin';
  name: string;
  email: string;
  items?: Item[];
  bids?: Bid[];
}