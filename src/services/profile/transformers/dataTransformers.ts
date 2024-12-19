import { DbItem, DbBid } from '../../../types/supabase';
import { Item } from '../../../types/item';
import { Bid } from '../../../types/bid';

export const transformItems = (items: DbItem[]): Item[] => {
  return items.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    price: item.price,
    seller_id: item.seller_id,
    category: item.category,
    shipping_options: item.shipping_options,
    status: item.status,
    created_at: item.created_at
  }));
};

export const transformBids = (bids: DbBid[]): Bid[] => {
  return bids.map(bid => ({
    id: bid.id,
    itemId: bid.item_id,
    bidderId: bid.bidder_id,
    amount: bid.amount,
    message: bid.message,
    shippingOption: bid.shipping_option,
    status: bid.status,
    created_at: bid.created_at
  }));
};