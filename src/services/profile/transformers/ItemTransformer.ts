import { BaseTransformer } from '.';
import { Item } from '../../../types/item';
import { Database } from '../../../types/supabase';

type ItemRow = Database['public']['Tables']['items']['Row'];

export class ItemTransformer extends BaseTransformer<ItemRow, Item> {
  transform(data: ItemRow): Item {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      price: data.price,
      seller_id: data.seller_id,
      category: data.category,
      shipping_options: data.shipping_options,
      status: data.status,
      created_at: data.created_at
    };
  }
}