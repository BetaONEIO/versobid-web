import { supabase } from '../../../lib/supabase';
import { DbItem } from '../../../types/supabase';
import { QueryResult } from '../types/queryTypes';
import { ITEM_SELECT_FIELDS } from '../constants/queryFields';
import { buildQuery } from '../utils/queryUtils';

export const itemQueries = {
  getUserItems: async (userId: string): Promise<QueryResult<DbItem[]>> => {
    try {
      const query = buildQuery('items', ITEM_SELECT_FIELDS, {
        orderBy: 'created_at',
        ascending: false
      });

      const response = await query.eq('seller_id', userId);

      return {
        data: response.data as DbItem[],
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