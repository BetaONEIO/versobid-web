import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { Bid } from '../types/bid';

type BidRow = Database['public']['Tables']['bids']['Row'];

const transformBid = (row: BidRow): Bid => ({
  id: row.id,
  item_id: row.item_id,
  bidder_id: row.bidder_id,
  amount: row.amount,
  message: row.message,
  status: row.status,
  created_at: row.created_at,
  counter_amount: row.counter_amount || undefined
});

export const chatService = {
  async getChats(userId: string): Promise<Bid[]> {
    try {
      const { data, error } = await supabase
        .from('bids')
        .select(`
          *,
          item:items(
            id,
            title,
            description,
            minPrice:min_price,
            maxPrice:max_price,
            seller_id,
            category,
            status,
            created_at
          ),
          bidder:profiles(
            id,
            username
          )
        `)
        .or(`bidder_id.eq.${userId},seller_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) return [];
      return (data || []).map(transformBid);
    } catch {
      return [];
    }
  },

  async getMessages(chatId: string): Promise<Bid[]> {
    try {
      const { data, error } = await supabase
        .from('bids')
        .select(`
          *,
          item:items(
            id,
            title,
            description,
            minPrice:min_price,
            maxPrice:max_price,
            seller_id,
            category,
            status,
            created_at
          ),
          bidder:profiles(
            id,
            username
          )
        `)
        .eq('id', chatId)
        .order('created_at', { ascending: true });

      if (error) return [];
      return (data || []).map(transformBid);
    } catch {
      return [];
    }
  }
};