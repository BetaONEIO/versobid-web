import { Item } from '../../../types/item';
import { Bid } from '../../../types/bid';

export interface DataTransformer<T extends Record<string, any>, U> {
  transform(data: T): U;
  transformMany(data: T[]): U[];
}

export type ItemTransformer = DataTransformer<
  Record<string, any>,
  Item
>;

export type BidTransformer = DataTransformer<
  Record<string, any>,
  Bid
>;