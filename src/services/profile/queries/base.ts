import { supabase } from '../../../lib/supabase';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { QueryResult } from './types';

export const createBaseQuery = <T extends Record<string, any>>(tableName: string) => ({
  select: async (query: string): Promise<QueryResult<T[]>> => {
    try {
      const response = await supabase
        .from(tableName)
        .select(query);

      return {
        data: response.data as T[],
        error: response.error
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error
      };
    }
  },

  selectSingle: async (query: string): Promise<QueryResult<T>> => {
    try {
      const response = await supabase
        .from(tableName)
        .select(query)
        .single();

      return {
        data: response.data as T,
        error: response.error
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error
      };
    }
  },

  where: (column: string, value: any): PostgrestFilterBuilder<any, any, T[]> => {
    return supabase
      .from(tableName)
      .select('*')
      .eq(column, value);
  }
});