import { supabase } from '../../lib/supabase';
import { ProfileService, Profile, ProfileInsert, ProfileUpdate } from './types';
import { validateProfileData, validateProfileUpdate } from './validators';
import { sanitizeProfile } from './utils';
import { PROFILE_ERRORS } from './constants';
import {
  ProfileError,
  ProfileValidationError,
  ProfileNotFoundError,
} from './errors';
import { Database } from '../../types/supabase';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

const transformProfile = (row: ProfileRow): Profile => ({
  id: row.id,
  created_at: row.created_at,
  username: row.username,
  full_name: row.full_name,
  avatar_url: row.avatar_url,
  email: row.email,
  is_admin: row.is_admin || false,
  shipping_address: row.shipping_address,
  payment_setup: row.payment_setup || false,
  onboarding_completed: row.onboarding_completed || false,
  rating: null
});

export const profileService: ProfileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        throw new ProfileError(error.message);
      }

      return data ? transformProfile(data as ProfileRow) : null;
    } catch (error) {
      console.error('Error in getProfile:', error);
      throw error;
    }
  },

  async createProfile(profile: ProfileInsert): Promise<Profile> {
    try {
      const sanitizedProfile = sanitizeProfile(profile);
      const errors = validateProfileData(sanitizedProfile);

      if (errors.length > 0) {
        throw new ProfileValidationError('Invalid profile data', errors);
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert([sanitizedProfile])
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        throw new ProfileError(error.message);
      }

      if (!data) throw new ProfileError(PROFILE_ERRORS.CREATION_FAILED);

      return transformProfile(data as ProfileRow);
    } catch (error) {
      console.error('Error in createProfile:', error);
      throw error;
    }
  },

  async updateProfile(
    userId: string,
    updates: ProfileUpdate
  ): Promise<Profile> {
    try {
      const sanitizedUpdates = sanitizeProfile(updates);
      const errors = validateProfileUpdate(sanitizedUpdates);

      if (errors.length > 0) {
        throw new ProfileValidationError('Invalid profile update data', errors);
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(sanitizedUpdates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        throw new ProfileError(error.message);
      }

      if (!data) throw new ProfileNotFoundError(userId);

      return transformProfile(data as ProfileRow);
    } catch (error) {
      console.error('Error in updateProfile:', error);
      throw error;
    }
  },

  async checkExistingUser(
    email: string,
    username: string
  ): Promise<{ emailExists: boolean; usernameExists: boolean }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email, username')
        .or(`email.eq.${email},username.eq.${username}`)
        .maybeSingle();

      if (error) {
        console.error('Error checking existing user:', error);
        throw new ProfileError(error.message);
      }

      return {
        emailExists: data?.email === email,
        usernameExists: data?.username === username,
      };
    } catch (error) {
      console.error('Error in checkExistingUser:', error);
      throw error;
    }
  },
};
