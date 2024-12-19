import { PostgrestError } from '@supabase/supabase-js';

export interface QueryResult<T> {
  data: T | null;
  error: PostgrestError | Error | null;
}

export interface QueryOptions {
  orderBy?: string;
  ascending?: boolean;
  limit?: number;
}