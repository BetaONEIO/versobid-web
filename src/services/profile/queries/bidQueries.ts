import { supabase } from '../../../lib/supabase';
import { DbBid } from '../../../types/supabase';
import { QueryResult } from './types';
import { ITEM_SELECT_FIELDS } from '../constants/queryFields';

export const bidQueries = {
  getUserBids: async (userId: string): Promise<QueryResult<DbBid>> => {
    try {
      const response = await supabase
        .from('bids')
        .select(`
          *,
          item:items (${ITEM_SELECT_FIELDS})
        `)
        .eq('bidder_id', userId)
        .order('created_at', { ascending: false });

      return {
        data: response.data,
        error: response.error
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error
      };
    }
  }
};