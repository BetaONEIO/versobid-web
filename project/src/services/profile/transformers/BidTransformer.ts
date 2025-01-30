import { BaseTransformer } from '.';
import { Bid, BidStatus } from '../../../types/bid';
import { Database } from '../../../types/supabase';

type BidRow = Database['public']['Tables']['bids']['Row'];

export class BidTransformer extends BaseTransformer<BidRow, Bid> {
  transform(data: BidRow): Bid {
    return {
      id: data.id,
      item_id: data.item_id,
      bidder_id: data.bidder_id,
      amount: data.amount,
      message: data.message || '',
      status: data.status as BidStatus,
      created_at: data.created_at
    };
  }
}