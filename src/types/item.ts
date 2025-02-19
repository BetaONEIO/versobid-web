// Shipping and location types
export interface PickupLocation {
  postcode: string;
  town: string;
  maxDistance?: number;
}

export type ShippingType = 'shipping' | 'seller-pickup';

export interface ShippingOption {
  type: ShippingType;
  cost?: number;
  location?: PickupLocation;
}

// Service details interface
export interface ServiceDetails {
  rateType: 'hourly' | 'fixed' | 'project';
  availability: string;
  location: string;
  remote: boolean;
}

// Form data interface
export interface ItemFormData {
  title: string;
  description: string;
  minPrice: number;
  maxPrice: number;
  category: string;
  shipping_options: ShippingOption[];
  condition?: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  image_url?: string;
  type?: 'item' | 'service';
  service_details?: ServiceDetails;
}

// Item filters interface
export interface ItemFilters {
  category?: string;
  status?: string;
  seller_id?: string;
  exclude_seller?: string;
  search?: string;
  type?: 'item' | 'service';
}

// Main item interface
export interface Item extends Omit<ItemFormData, 'shipping_options'> {
  id: string;
  seller_id: string;
  shipping_options: ShippingOption[];
  status: 'active' | 'completed' | 'archived';
  created_at: string;
  seller_username?: string;
  archived_reason?: string;
  archived_at?: string;
}