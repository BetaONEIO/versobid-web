import { supabase } from '../lib/supabase';
import { Item, ItemFilters } from '../types/item';
import { Database } from '../types/supabase';

type ItemRow = Database['public']['Tables']['items']['Row'];
type ItemInsert = Database['public']['Tables']['items']['Insert'];
type ItemUpdate = Database['public']['Tables']['items']['Update'];

const transformItem = (row: ItemRow, buyer_username?: string): Item => ({
  id: row.id,
  title: row.title,
  description: row.description || '',
  minPrice: row.min_price,
  maxPrice: row.max_price,
  sellerId: row.seller_id,
  buyerId: row.buyer_id ,
  category: row.category,
  shippingOptions: row.shipping_options || [],
  status: row.status,
  createdAt: row.created_at,
  buyerUsername: buyer_username,
  imageUrl: row.image_url
});

export const itemService = {
  async getItems(filters?: ItemFilters & { search?: string }): Promise<Item[]> {
    try {
      let query = supabase
        .from('items')
        .select(`
          *,
          buyer:profiles!items_buyer_id_fkey(
            username,
            full_name
          )
        `);

      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.buyer_id) {
        query = query.eq('buyer_id', filters.buyer_id);
      }
      if (filters?.exclude_seller) {
        query = query.neq('buyer_id', filters.exclude_seller);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching items:', error);
        return [];
      }

      return (data || []).map(item => transformItem(item, item.buyer?.username));
    } catch (error) {
      console.error('Error in getItems:', error);
      return [];
    }
  },

  async getItem(id: string): Promise<Item | null> {
    try {
      const { data, error } = await supabase
        .from('items')
        .select(`
          *,
          buyer:profiles!items_buyer_id_fkey(
            username
          )
        `)
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('Error fetching item:', error);
        return null;
      }

      return transformItem(data, data.buyer?.username);
    } catch (error) {
      console.error('Error in getItem:', error);
      return null;
    }
  },

  async createItem(item: Omit<Item, 'id' | 'createdAt'>): Promise<Item | null> {
    try {
      const itemData: ItemInsert = {
        title: item.title,
        description: item.description,
        min_price: item.minPrice,
        max_price: item.maxPrice,
        buyer_id: item.buyerId,
        category: item.category,
        shipping_options: item.shippingOptions,
        status: item.status,
        image_url: item.imageUrl
      };

      const { data, error } = await supabase
        .from('items')
        .insert(itemData)
        .select(`
          *,
          buyer:profiles!items_buyer_id_fkey(
            username
          )
        `)
        .single();

      if (error || !data) {
        console.error('Error creating item:', error);
        return null;
      }

      return transformItem(data, data.seller?.username);
    } catch (error) {
      console.error('Error in createItem:', error);
      return null;
    }
  },

  async deleteListing(id: string): Promise<boolean> {
    try {
      const updateData: ItemUpdate = {
        status: 'archived'
      };

      const { error } = await supabase
        .from('items')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error deleting listing:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteListing:', error);
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

      if (error) {
        console.error('Error checking pending bids:', error);
        return false;
      }

      return (count || 0) > 0;
    } catch (error) {
      console.error('Error in checkPendingBids:', error);
      return false;
    }
  }
};