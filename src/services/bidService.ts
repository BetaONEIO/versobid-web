import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Bid = Database['public']['Tables']['bids']['Row'];
type BidInsert = Database['public']['Tables']['bids']['Insert'];
type BidUpdate = Database['public']['Tables']['bids']['Update'];

export const bidService = {
  async getBids(itemId: string): Promise<Bid[]> {
    const { data, error } = await supabase
      .from('bids')
      .select('*')
      .eq('item_id', itemId)
      .order('amount', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getUserBids(userId: string): Promise<Bid[]> {
    const { data, error } = await supabase
      .from('bids')
      .select('*')
      .eq('bidder_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createBid(bid: BidInsert): Promise<Bid> {
    const { data, error } = await supabase
      .from('bids')
      .insert([bid])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateBidStatus(id: string, status: BidUpdate['status']): Promise<Bid> {
    const { data, error } = await supabase
      .from('bids')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};