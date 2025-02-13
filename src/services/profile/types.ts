import { Database } from '../../types/supabase';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export interface ProfileService {
  getProfile: (userId: string) => Promise<Profile | null>;
  createProfile: (profile: ProfileInsert) => Promise<Profile>;
  updateProfile: (userId: string, updates: ProfileUpdate) => Promise<Profile>;
  checkExistingUser: (email: string, username: string) => Promise<{
    emailExists: boolean;
    usernameExists: boolean;
  }>;
}

export interface ProfileValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  profile?: Profile;
  errors?: string[];
}