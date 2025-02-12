export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  is_admin: boolean;
  email_verified: boolean;
  shipping_address?: {
    street: string;
    city: string;
    postcode: string;
    country: string;
  } | null;
  payment_setup?: boolean;
  onboarding_completed?: boolean;
}

export type UserRole = 'buyer' | 'seller';