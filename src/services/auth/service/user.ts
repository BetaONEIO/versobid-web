import { supabase } from '../../../lib/supabase';
import { User } from '../../../types';
import { profileService } from '../../profileService';

export const getUserProfile = async (userId: string): Promise<User> => {
  const profile = await profileService.getUserProfile(userId);
  if (!profile) throw new Error('Profile not found');

  return {
    id: profile.id,
    name: profile.full_name,
    email: profile.email,
    username: profile.username
  };
};

export const checkExistingUsername = async (username: string): Promise<void> => {
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .single();

  if (existingUser) {
    throw new Error('Username already taken');
  }
};