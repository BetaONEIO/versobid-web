export interface Bid {
  id: string;
  title: string;
  description: string;
  amount: number;
  createdAt: Date;
  status: 'open' | 'closed' | 'pending';
}

export interface User {
  id: string;
  name: string;
  email: string;
  bids: Bid[];
}

export type UserRole = 'buyer' | 'seller';

export interface AuthFormData {
  email: string;
  password: string;
  name?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}