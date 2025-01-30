import { Database as GeneratedDatabase } from './supabase';

export type Database = GeneratedDatabase;

export type DbResult<T> = T extends PromiseLike<infer U> ? U : never;

export type DbError = {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
};

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Helper type for handling Supabase query results
export type QueryResult<T> = {
  data: T | null;
  error: DbError | null;
};

// Helper type for handling Supabase query results with count
export type QueryResultWithCount<T> = QueryResult<T> & {
  count: number | null;
};