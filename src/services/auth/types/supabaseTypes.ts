import { User } from '@supabase/supabase-js';

// Define a type that omits the problematic field
type UserWithoutConfirmedAt = Omit<User, 'confirmed_at'>;

// Create a new interface that extends the modified User type
export interface SupabaseAuthUser extends UserWithoutConfirmedAt {
  email_verified?: boolean;
  confirmed_at?: string | null;
}

export interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  user: SupabaseAuthUser;
}