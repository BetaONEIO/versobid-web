import { supabase } from '../lib/supabase';
import { Bid, BidStatus } from '../types/bid';
import { Database } from '../types/supabase';

type BidRow = Database['public']['Tables']['bids']['Row'];
type BidInsert = Database['public']['Tables']['bids']['Insert'];
type BidUpdate = Database['public']['Tables']['bids']['Update'];

interface BidWithRelations extends BidRow {
  bidder?: { username: string };
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
  item: data.item && {
    ...data.item,
    minPrice: data.item.min_price,
    maxPrice: data.item.max_price
  }
});

export const bidService = {
  async createBid(itemId: string, amount: number, message?: string): Promise<Bid | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const bidData: BidInsert = {
        item_id: itemId,
        bidder_id: user.id,
        amount,
        message: message || null,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('bids')
        .insert(bidData)
        .select(`
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
        `)
        .single();

      if (error || !data) return null;
      return transformBid(data);
    } catch {
      return null;
    }
  },

  async updateBidStatus(bidId: string, status: BidStatus, counterOffer?: number): Promise<boolean> {
    try {
      const updateData: BidUpdate = {
        status,
        ...(counterOffer !== undefined && { counter_amount: counterOffer })
      };

      const { error } = await supabase
        .from('bids')
        .update(updateData)
        .eq('id', bidId);

      return !error;
    } catch {
      return false;
    }
  },

  async getBidsForItem(userId: string): Promise<Bid[]> {
    try {
      const { data, error } = await supabase
        .from('bids')
        .select(`
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
        `)
        .eq('bidder_id', userId)
        .order('created_at', { ascending: false });

      if (error) return [];
      return (data || []).map(transformBid);
    } catch {
      return [];
    }
  },

  async getReceivedBids(userId: string): Promise<Bid[]> {
    try {
      const { data, error } = await supabase
        .from('bids')
        .select(`
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
        `)
        .eq('item.seller_id', userId)
        .order('created_at', { ascending: false });

      if (error) return [];
      return (data || []).map(transformBid);
    } catch {
      return [];
    }
  },

  async respondToCounter(bidId: string, accept: boolean): Promise<boolean> {
    try {
      const status = accept ? 'accepted' : 'rejected';
      const { error } = await supabase
        .from('bids')
        .update({ status })
        .eq('id', bidId);

      return !error;
    } catch {
      return false;
    }
  }
};