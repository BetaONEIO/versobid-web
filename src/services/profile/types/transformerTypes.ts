import { DbItem, DbBid, DbProfile } from '../../../types/supabase';
import { Item } from '../../../types/item';
import { Bid } from '../../../types/bid';
import { UserProfile } from '../../../types/profile';

export interface DataTransformer<T, U> {
  transform(data: T): U;
  transformMany(data: T[]): U[];
}

export interface ProfileTransformer extends DataTransformer<DbProfile, UserProfile> {}
export interface ItemTransformer extends DataTransformer<DbItem, Item> {}
export interface BidTransformer extends DataTransformer<DbBid, Bid> {}