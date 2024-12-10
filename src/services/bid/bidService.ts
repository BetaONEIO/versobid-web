import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/supabase';
import { Bid } from '../../types';

type SupabaseBid = Database['public']['Tables']['bids']['Row'];
type BidInsert = Database['public']['Tables']['bids']['Insert'];
type BidUpdate = Database['public']['Tables']['bids']['Update'];

const mapBidToModel = (bid: SupabaseBid): Bid => ({
  id: bid.id,
  title: '', // This should come from joining with items table
  description: '', // This should come from joining with items table
  amount: bid.amount,
  createdAt: new Date(bid.created_at),
  status: bid.status === 'accepted' ? 'closed' : 
         bid.status === 'rejected' ? 'closed' : 'open'
});

export const bidService = {
  async getAllBids(): Promise<Bid[]> {
    const { data: bids, error } = await supabase
      .from('bids')
      .select(`
        *,
        items:item_id (
          title,
          description
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (bids || []).map(bid => ({
      ...mapBidToModel(bid),
      title: bid.items?.title || '',
      description: bid.items?.description || ''
    }));
  },

  async getUserBids(userId: string): Promise<Bid[]> {
    const { data: bids, error } = await supabase
      .from('bids')
      .select(`
        *,
        items:item_id (
          title,
          description
        )
      `)
      .eq('bidder_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (bids || []).map(bid => ({
      ...mapBidToModel(bid),
      title: bid.items?.title || '',
      description: bid.items?.description || ''
    }));
  }
};