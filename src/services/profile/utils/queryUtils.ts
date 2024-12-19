import { QueryOptions } from '../types/queryTypes';
import { supabase } from '../../../lib/supabase';

export const buildQuery = (tableName: string, query: string, options?: QueryOptions) => {
  let queryBuilder = supabase
    .from(tableName)
    .select(query);

  if (options?.orderBy) {
    queryBuilder = queryBuilder.order(options.orderBy, { 
      ascending: options.ascending ?? false 
    });
  }

  if (options?.limit) {
    queryBuilder = queryBuilder.limit(options.limit);
  }

  return queryBuilder;
};

export const sanitizeQuery = (query: string): string => {
  return query.replace(/\s+/g, ' ').trim();
};