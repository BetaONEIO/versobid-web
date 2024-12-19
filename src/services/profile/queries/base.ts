import { GenericStringError } from '../types/errors';

export async function handleQueryResult<T extends Record<string, any>>(
  result: { data: T[] | null; error: GenericStringError | null }
): Promise<T[]> {
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data as T[] || [];
}

export async function handleSingleResult<T extends Record<string, any>>(
  result: { data: T | null; error: GenericStringError | null }
): Promise<T> {
  if (result.error) {
    throw new Error(result.error.message);
  }
  if (!result.data) {
    throw new Error('Not found');
  }
  return result.data as T;
}