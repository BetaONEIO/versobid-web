import { Bid } from '../types/bid';

export const sortBidsByDate = (bids: Bid[]): Bid[] => {
  return [...bids].sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return dateB.getTime() - dateA.getTime();
  });
};

export const filterBidsByStatus = (bids: Bid[], status: Bid['status']): Bid[] => {
  return bids.filter(bid => bid.status === status);
};

export const calculateTotalBidAmount = (bids: Bid[]): number => {
  return bids.reduce((total, bid) => total + bid.amount, 0);
};