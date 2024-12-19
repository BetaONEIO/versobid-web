import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

type Chat = Database['public']['Tables']['bids']['Row'];
type Message = Database['public']['Tables']['bids']['Row'];

export const chatService = {
  async getChats(userId: string): Promise<Chat[]> {
    const { data, error } = await supabase
      .from('bids')
      .select('*')
      .or(`bidder_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getMessages(chatId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('bids')
      .select('*')
      .eq('id', chatId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }
};