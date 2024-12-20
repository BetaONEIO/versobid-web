import { PostgrestSingleResponse } from '@supabase/supabase-js';

export async function handleQueryResult<T extends Record<string, any>>(
  result: PostgrestSingleResponse<T[]>
): Promise<T[]> {
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data || [];
}

export async function handleSingleResult<T extends Record<string, any>>(
  result: PostgrestSingleResponse<T>
): Promise<T> {
  if (result.error) {
    throw new Error(result.error.message);
  }
  if (!result.data) {
    throw new Error('Not found');
  }
  return result.data;
}