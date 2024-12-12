export interface ShippingOption {
  type: 'shipping' | 'pickup';
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