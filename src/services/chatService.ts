import { supabase } from '../lib/supabase';
import { DbBid } from '../types/supabase';

export const chatService = {
  async getChats(userId: string): Promise<DbBid[]> {
    const { data, error } = await supabase
      .from('bids')
      .select('*')
      .or(`bidder_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getMessages(chatId: string): Promise<DbBid[]> {
    const { data, error } = await supabase
      .from('bids')
      .select('*')
      .eq('id', chatId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }
};