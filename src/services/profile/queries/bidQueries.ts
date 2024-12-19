import { supabase } from '../../../lib/supabase';
import { DbBid } from '../../../types/supabase';
import { QueryResult } from '../types/queryTypes';
import { ITEM_SELECT_FIELDS } from '../constants/queryFields';
import { buildQuery, sanitizeQuery } from '../utils/queryUtils';

export const bidQueries = {
  getUserBids: async (userId: string): Promise<QueryResult<DbBid[]>> => {
    try {
      const fullQuery = sanitizeQuery(`
        *,
        item:items (${ITEM_SELECT_FIELDS})
      `);

      const query = buildQuery('bids', fullQuery, {
        orderBy: 'created_at',
        ascending: false
      });

      const response = await query.eq('bidder_id', userId);

      return {
        data: response.data as DbBid[],
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