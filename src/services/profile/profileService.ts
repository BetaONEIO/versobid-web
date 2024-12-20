import { supabase } from '../../lib/supabase';
import { Profile } from '../../types/profile';
import { handleQueryResult, handleSingleResult } from './queries/base';
import { ItemTransformer } from './transformers/ItemTransformer';
import { BidTransformer } from './transformers/BidTransformer';
import { Database } from '../../types/supabase';

const itemTransformer = new ItemTransformer();
const bidTransformer = new BidTransformer();

type ItemRow = Database['public']['Tables']['items']['Row'];
type BidRow = Database['public']['Tables']['bids']['Row'];

export const profileService = {
  async getProfile(userId: string): Promise<Profile> {
    const result = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    return handleSingleResult(result);
  },

  async createProfile(profile: Partial<Profile>): Promise<Profile> {
    const result = await supabase
      .from('profiles')
      .insert([profile])
      .select()
      .single();

    return handleSingleResult(result);
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const result = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    return handleSingleResult(result);
  },

  async getProfileItems(userId: string) {
    const result = await supabase
      .from('items')
      .select('*')
      .eq('seller_id', userId);

    const items = await handleQueryResult<ItemRow>(result);
    return itemTransformer.transformMany(items);
  },

  async getProfileBids(userId: string) {
    const result = await supabase
      .from('bids')
      .select('*')
      .eq('bidder_id', userId);

    const bids = await handleQueryResult<BidRow>(result);
    return bidTransformer.transformMany(bids);
  }
};