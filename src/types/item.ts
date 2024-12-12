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
  shipping: ShippingOption[];
}

export interface ItemInsert {
  title: string;
  description: string;
  price: number;
  seller_id: string;
  category: string;
  shipping_options: {
    type: ShippingType;
    cost?: number;
    location?: string;
  }[];
  status?: 'active' | 'sold' | 'archived';
}

export interface Item extends ItemInsert {
  id: string;
  created_at: string;
}