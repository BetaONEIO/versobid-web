import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Chat = Database['public']['Tables']['chats']['Row'];
type ChatInsert = Database['public']['Tables']['chats']['Insert'];
type Message = Database['public']['Tables']['messages']['Row'];
type MessageInsert = Database['public']['Tables']['messages']['Insert'];

export const chatService = {
  async getChats(userId: string): Promise<Chat[]> {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createChat(chat: ChatInsert): Promise<Chat> {
    const { data, error } = await supabase
      .from('chats')
      .insert([chat])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getMessages(chatId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async sendMessage(message: MessageInsert): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert([message])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('chat_id', chatId)
      .neq('sender_id', userId);

    if (error) throw error;
  }
};