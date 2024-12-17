import { createBaseQuery } from './base';
import { DbItem } from '../../../types/supabase';
import { ITEM_SELECT_FIELDS } from '../constants';
import { QueryResult } from './types';

const baseQuery = createBaseQuery<'items'>('items');

export const itemQueries = {
  getUserItems: async (userId: string): Promise<QueryResult<DbItem>> => {
    const response = await baseQuery
      .select(ITEM_SELECT_FIELDS)
      .eq('seller_id', userId)
      .order('created_at', { ascending: false });

    return {
      data: response.data,
      error: response.error
    };
  }
};