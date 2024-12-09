import { create } from 'zustand';
import { Item, Bid, User } from '../types';

interface Store {
  items: Item[];
  users: User[];
  bids: Bid[];
  currentUser: User | null;
  addItem: (item: Item) => void;
  addBid: (bid: Bid) => void;
  setCurrentUser: (user: User) => void;
}

export const useStore = create<Store>((set) => ({
  items: [],
  users: [
    { id: '1', role: 'buyer', name: 'John Buyer', email: 'john@example.com' },
    { id: '2', role: 'seller', name: 'Jane Seller', email: 'jane@example.com' },
    { id: '3', role: 'admin', name: 'Admin User', email: 'admin@example.com' },
  ],
  bids: [],
  currentUser: null,
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  addBid: (bid) => set((state) => ({ bids: [...state.bids, bid] })),
  setCurrentUser: (user) => set({ currentUser: user }),
}));