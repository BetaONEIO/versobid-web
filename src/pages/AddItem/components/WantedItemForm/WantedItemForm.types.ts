export interface PickupLocation {
  postcode: string;
  town: string;
  maxDistance?: number;
}

export type ShippingType = "shipping" | "seller-pickup";

export interface ServiceDetails {
  rateType: "hourly" | "fixed" | "project";
  availability: string;
  location: string;
  remote: boolean;
}

export interface InputsType {
  title: string;
  description: string;
  minPrice: number;
  maxPrice: number;
  category: string;
  shipping_type: ShippingType[];
  shipping_cost?: number;
  location: PickupLocation
  condition?: "new" | "like-new" | "good" | "fair" | "poor";
  image_url?: string;
  type?: "item" | "service";
  service_details?: ServiceDetails;
  image: File | null
}

export interface SuggestionItemType {
  title: string;
  imageUrl: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  condition: string;
}
