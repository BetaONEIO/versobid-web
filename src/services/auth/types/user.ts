import { User as SupabaseUser } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  username: string;
  is_admin: boolean;
  email_verified: boolean;
  shipping_address?: {
    street: string | null;
    city: string | null;
    postcode: string | null;
    country: string | null;
  } | null | undefined;
  payment_setup?: boolean;
  onboarding_completed?: boolean;
}

// Type for Supabase user with additional fields
export interface SupabaseAuthUser extends Omit<SupabaseUser, 'confirmed_at'> {
  email_verified: boolean;
  confirmed_at?: string | null;
}