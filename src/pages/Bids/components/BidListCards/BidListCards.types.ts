import { Bid } from '../../../../types';

export interface BidListProps {
  bids: Bid[];
  onBidSelect?: (bid: Bid) => void;
}