import { supabase } from '../lib/supabase';
import { Item, ItemFilters } from '../types/item';
import { Database } from '../types/supabase';

type ItemRow = Database['public']['Tables']['items']['Row'];
type ItemInsert = Database['public']['Tables']['items']['Insert'];
type ItemUpdate = Database['public']['Tables']['items']['Update'];

const transformItem = (row: ItemRow, seller_username?: string): Item => ({
  id: row.id,
  title: row.title,
  description: row.description || '',
  minPrice: row.min_price,
  maxPrice: row.max_price,
  seller_id: row.seller_id,
  category: row.category,
  shipping_options: row.shipping_options || [],
  status: row.status,
  created_at: row.created_at,
  seller_username: seller_username,
  image_url: row.image_url
});

export const itemService = {
  async getItems(filters?: ItemFilters & { search?: string }): Promise<Item[]> {
    try {
      let query = supabase
        .from('items')
        .select(`
          *,
          seller:profiles!seller_id (
            username
          )
        `);

      if (filters?.search) query = query.ilike('title', `%${filters.search}%`);
      if (filters?.category) query = query.eq('category', filters.category);
      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.seller_id) query = query.eq('seller_id', filters.seller_id);
      if (filters?.exclude_seller) query = query.neq('seller_id', filters.exclude_seller);

      const { data, error } = await query;
      if (error) return [];
      return (data || []).map(item => transformItem(item, item.seller?.username));
    } catch {
      return [];
    }
  },

  async getItem(id: string): Promise<Item | null> {
    try {
      const { data, error } = await supabase
        .from('items')
        .select(`
          *,
          seller:profiles!seller_id (
            username
          )
        `)
        .eq('id', id)
        .single();

      if (error || !data) return null;
      return transformItem(data, data.seller?.username);
    } catch {
      return null;
    }
  },

  async createItem(item: Omit<Item, 'id' | 'created_at'>): Promise<Item | null> {
    try {
      const itemData: ItemInsert = {
        title: item.title,
        description: item.description,
        min_price: item.minPrice,
        max_price: item.maxPrice,
        seller_id: item.seller_id,
        category: item.category,
        shipping_options: item.shipping_options,
        status: item.status,
        image_url: item.image_url
      };

      const { data, error } = await supabase
        .from('items')
        .insert(itemData)
        .select()
        .single();

      if (error || !data) return null;
      return transformItem(data);
    } catch {
      return null;
    }
  },

  async deleteListing(id: string, reason: string): Promise<boolean> {
    try {
      const updateData: ItemUpdate = {
        status: 'archived',
        archived_reason: reason
      };

      const { error } = await supabase
        .from('items')
        .update(updateData)
        .eq('id', id);

      return !error;
    } catch {
      return false;
    }
  },

  async checkPendingBids(itemId: string): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from('bids')
        .select('*', { count: 'exact', head: true })
        .eq('item_id', itemId)
        .eq('status', 'pending');

      if (error) return false;
      return (count || 0) > 0;
    } catch {
      return false;
    }
  }
};