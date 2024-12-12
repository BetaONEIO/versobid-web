import { Bid } from './bid';

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  bids: Bid[];
}

export type UserRole = 'buyer' | 'seller';