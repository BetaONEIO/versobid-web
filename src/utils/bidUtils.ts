import { Bid } from '../types';

export const sortBidsByDate = (bids: Bid[]): Bid[] => {
  return [...bids].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const filterBidsByStatus = (bids: Bid[], status: Bid['status']): Bid[] => {
  return bids.filter(bid => bid.status === status);
};

export const calculateTotalBidAmount = (bids: Bid[]): number => {
  return bids.reduce((total, bid) => total + bid.amount, 0);
};