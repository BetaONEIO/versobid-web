export type ShippingType = 'shipping' | 'pickup';

export interface ShippingOption {
  type: ShippingType;
  cost?: number;
  location?: string;
}

export interface Item {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  category: string;
  shipping: ShippingOption[];
  status: 'active' | 'sold' | 'archived';
  createdAt: string;
}

export interface ItemFormData {
  title: string;
  description: string;
  price: number;
  category: string;
  shipping: ShippingOption[];
}

export interface ItemResponse {
  success: boolean;
  message: string;
  item?: Item;
}