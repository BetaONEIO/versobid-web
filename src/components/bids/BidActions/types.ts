import { Bid } from '../../../types/bid';

export interface BidActionsProps {
  bid: Bid;
  onActionTaken: () => void;
}