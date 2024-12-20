export type ShippingType = 'shipping' | 'pickup';

export interface ShippingOption {
  type: ShippingType;
  cost?: number;
  location?: string;
}

export interface ItemFormData {
  title: string;
  description: string;
  price: number;
  category: string;
  shipping_options: ShippingOption[];
}

export interface ItemInsert {
  title: string;
  description: string;
  price: number;
  seller_id: string;
  category: string;
  shipping_options: ShippingOption[];
  status?: 'active' | 'sold' | 'archived';
}

export interface Item extends ItemInsert {
  id: string;
  created_at: string;
}