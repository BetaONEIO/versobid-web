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
  shippingOptions: ShippingType;
  condition?: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  imageUrl?: string;
  type?: 'item' | 'service';
  serviceDetails?: ServiceDetails | null;
}

// Item filters interface
export interface ItemFilters {
  category?: string;
  status?: string;
  buyer_id?: string;
  exclude_seller?: string;
  search?: string;
  type?: 'item' | 'service';
}

// Main item interface
export interface Item extends ItemFormData {
  id: string;
  sellerId?: string;
  buyerId: string;
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  sellerUsername?: string;
  buyerUsername?: string;
  username?: string;
  full_name?: string;
  archivedReason?: string;
  archivedAt?: string;
}