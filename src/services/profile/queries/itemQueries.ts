import { supabase } from '../../../lib/supabase';
import { DbItem } from '../../../types/supabase';
import { QueryResult } from './types';
import { ITEM_SELECT_FIELDS } from '../constants/queryFields';

export const itemQueries = {
  getUserItems: async (userId: string): Promise<QueryResult<DbItem>> => {
    try {
      const response = await supabase
        .from('items')
        .select(ITEM_SELECT_FIELDS)
        .eq('seller_id', userId)
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