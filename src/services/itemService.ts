import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Item = Database['public']['Tables']['items']['Row'];
type ItemInsert = Database['public']['Tables']['items']['Insert'];
type ItemUpdate = Database['public']['Tables']['items']['Update'];

export const itemService = {
  async getItems(filters?: { category?: string; status?: string }): Promise<Item[]> {
    let query = supabase.from('items').select('*');

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getItem(id: string): Promise<Item | null> {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createItem(item: ItemInsert): Promise<Item> {
    const { data, error } = await supabase
      .from('items')
      .insert([item])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateItem(id: string, updates: ItemUpdate): Promise<Item> {
    const { data, error } = await supabase
      .from('items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};