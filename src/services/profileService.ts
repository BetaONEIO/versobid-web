import { supabase } from '../lib/supabase';
import { Profile } from '../types/profile';
import { Database } from '../types/database';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

const transformProfile = (row: ProfileRow): Profile => ({
  id: row.id,
  created_at: row.created_at,
  username: row.username,
  full_name: row.full_name,
  avatar_url: row.avatar_url || null,
  email: row.email,
  is_admin: row.is_admin || false,
  shipping_address: row.shipping_address || undefined,
  payment_setup: row.payment_setup || false,
  onboarding_completed: row.onboarding_completed || false,
  rating: row.rating
});

export const profileService = {
  async getProfileByUsername(username: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        console.error('Error fetching profile by username:', error);
        return null;
      }

      return data ? transformProfile(data) : null;
    } catch (error) {
      console.error('Unexpected error in getProfileByUsername:', error);
      throw error;
    }
  },

  async uploadAvatar(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        throw new Error('Failed to upload avatar.');
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Unexpected error in uploadAvatar:', error);
      throw error;
    }
  },

  async updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        throw new Error('Failed to update profile.');
      }

      if (!data) throw new Error('No data returned for profile update.');

      return transformProfile(data);
    } catch (error) {
      console.error('Unexpected error in updateProfile:', error);
      throw error;
    }
  }
};