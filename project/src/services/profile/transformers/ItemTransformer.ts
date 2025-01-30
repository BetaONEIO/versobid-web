import { BaseTransformer } from '.';
import { Item } from '../../../types/item';

interface ItemRow {
  id: string;
  title: string;
  description: string;
  min_price: number;
  max_price: number;
  seller_id: string;
  category: string;
  shipping_options: any[];
  status: 'active' | 'completed' | 'archived';
  created_at: string;
}

export class ItemTransformer extends BaseTransformer<ItemRow, Item> {
  transform(data: ItemRow): Item {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      minPrice: data.min_price,
      maxPrice: data.max_price,
      seller_id: data.seller_id,
      category: data.category,
      shipping_options: data.shipping_options,
      status: data.status,
      created_at: data.created_at
    };
  }
}