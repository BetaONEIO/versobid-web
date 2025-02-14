export interface Profile {
  id: string;
  created_at: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  email: string;
  is_admin?: boolean;
  shipping_address?: {
    street: string | null;
    city: string | null;
    postcode: string | null;
    country: string | null;
  } | null;
  payment_setup?: boolean;
  onboarding_completed?: boolean;
}