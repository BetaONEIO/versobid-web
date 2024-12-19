import { BaseTransformer } from './BaseTransformer';
import { DbBid } from '../../../types/supabase';
import { Bid } from '../../../types/bid';
import { BidTransformer as IBidTransformer } from '../types/transformerTypes';

export class BidTransformer extends BaseTransformer<DbBid, Bid> implements IBidTransformer {
  transform(bid: DbBid): Bid {
    return {
      id: bid.id,
      itemId: bid.item_id,
      bidderId: bid.bidder_id,
      amount: bid.amount,
      message: bid.message,
      shippingOption: bid.shipping_option,
      status: bid.status,
      created_at: bid.created_at
    };
  }
}

export const bidTransformer = new BidTransformer();