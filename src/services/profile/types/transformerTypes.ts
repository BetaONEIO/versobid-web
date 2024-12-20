import { Database } from '../../../types/supabase';
import { Item } from '../../../types/item';
import { Bid } from '../../../types/bid';

export interface DataTransformer<T extends Record<string, any>, U> {
  transform(data: T): U;
  transformMany(data: T[]): U[];
}

export type ItemTransformer = DataTransformer<
  Database['public']['Tables']['items']['Row'],
  Item
>;

export type BidTransformer = DataTransformer<
  Database['public']['Tables']['bids']['Row'],
  Bid
>;