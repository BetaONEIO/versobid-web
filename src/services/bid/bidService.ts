import { supabase } from '../../lib/supabase';
import { Bid, BidStatus } from '../../types/bid';
import { Database } from '../../types/supabase';

type BidInsert = Database['public']['Tables']['bids']['Insert'];
type BidUpdate = Database['public']['Tables']['bids']['Update'];
type BidRow = Database['public']['Tables']['bids']['Row'];

interface BidWithRelations extends BidRow {
  bidder?: {
    username: string;
  };
  item?: {
    id: string;
    title: string;
    description: string;
    min_price: number;
    max_price: number;
    seller_id: string;
    category: string;
    status: string;
    created_at: string;
  };
}

const transformBid = (data: BidWithRelations): Bid => ({
  id: data.id,
  item_id: data.item_id,
  bidder_id: data.bidder_id,
  amount: data.amount,
  message: data.message || '',
  status: data.status,
  created_at: data.created_at,
  counter_amount: data.counter_amount || undefined,
  bidder: data.bidder,
  item: data.item,
});

export const bidService = {
  async createBid(
    bid: Omit<Bid, 'id' | 'created_at' | 'status'>
  ): Promise<Bid> {
    const bidData: BidInsert = {
      item_id: bid.item_id,
      bidder_id: bid.bidder_id,
      amount: bid.amount,
      message: bid.message || null,
      status: 'pending',
    };

    const { data, error } = await supabase
      .from('bids')
      .insert([bidData])
      .select(
        `
        *,
        bidder:profiles(username),
        item:items(
          id,
          title,
          description,
          min_price,
          max_price,
          seller_id,
          category,
          status,
          created_at
        )
      `
      )
      .single();

    if (error) {
      console.error('Error creating bid:', error);
      throw new Error('Failed to create bid');
    }

    if (!data) {
      throw new Error('No bid data returned');
    }

    return transformBid(data);
  },

  async updateBidStatus(
    bidId: string,
    status: BidStatus,
    counterAmount?: number
  ): Promise<void> {
    const updateData: BidUpdate = {
      status,
      ...(counterAmount !== undefined && { counter_amount: counterAmount }),
    };

    const { error } = await supabase
      .from('bids')
      .update(updateData)
      .eq('id', bidId);

    if (error) {
      console.error('Error updating bid status:', error);
      throw new Error('Failed to update bid status');
    }
  },

  async getBidsForItem(userId: string): Promise<Bid[]> {
    const { data, error } = await supabase
      .from('bids')
      .select(
        `
        *,
        bidder:profiles(username),
        item:items(
          id,
          title,
          description,
          min_price,
          max_price,
          seller_id,
          category,
          status,
          created_at
        )
      `
      )
      .eq('bidder_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bids for item:', error);
      throw new Error('Failed to fetch bids for item');
    }

    return (data || []).map(transformBid);
  },

  async getReceivedBids(userId: string): Promise<Bid[]> {
    const { data, error } = await supabase
      .from('bids')
      .select(
        `
        *,
        bidder:profiles(username),
        item:items!inner(
          id,
          title,
          description,
          min_price,
          max_price,
          seller_id,
          category,
          status,
          created_at
        )
      `
      )
      .eq('item.seller_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching received bids:', error);
      throw new Error('Failed to fetch received bids');
    }

    return (data || []).map(transformBid);
  },

  async respondToCounter(bidId: string, accept: boolean): Promise<void> {
    const status = accept ? 'accepted' : 'rejected';

    const { error } = await supabase
      .from('bids')
      .update({ status })
      .eq('id', bidId);

    if (error) {
      console.error('Error responding to counter bid:', error);
      throw new Error('Failed to respond to counter bid');
    }
  },
};
