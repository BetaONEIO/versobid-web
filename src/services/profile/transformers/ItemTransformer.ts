import { BaseTransformer } from './BaseTransformer';
import { DbItem } from '../../../types/supabase';
import { Item } from '../../../types/item';
import { ItemTransformer as IItemTransformer } from '../types/transformerTypes';

export class ItemTransformer extends BaseTransformer<DbItem, Item> implements IItemTransformer {
  transform(item: DbItem): Item {
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      price: item.price,
      seller_id: item.seller_id,
      category: item.category,
      shipping_options: item.shipping_options,
      status: item.status,
      created_at: item.created_at
    };
  }
}

export const itemTransformer = new ItemTransformer();