import { User as SupabaseUser } from '@supabase/supabase-js';

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
  };
  payment_setup?: boolean;
  onboarding_completed?: boolean;
}

export type UserRole = 'buyer' | 'seller';

// Type for Supabase user with additional fields
export interface ExtendedSupabaseUser extends SupabaseUser {
  email_verified: boolean;
}