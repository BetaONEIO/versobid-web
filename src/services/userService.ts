import { supabase } from '../lib/supabase';
import { AuthFormData, User } from '../types';
import { profileService } from './profileService';

export const userService = {
  signup: async (formData: AuthFormData): Promise<User> => {
    // Check if email exists
    const { data: existingEmail } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', formData.email)
      .single();

    if (existingEmail) {
      throw new Error('Email already registered');
    }

    // Check if username exists
    const { data: existingUsername } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', formData.username)
      .single();

    if (existingUsername) {
      throw new Error('Username already taken');
    }

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create user account');

    // Create profile
    const profile = await profileService.createProfile({
      id: authData.user.id,
      username: formData.username,
      full_name: formData.name,
      email: formData.email,
      created_at: new Date().toISOString(),
      avatar_url: null
    });

    return {
      id: profile.id,
      name: profile.full_name,
      email: profile.email,
      username: profile.username
    };
  },

  login: async (identifier: string, password: string): Promise<User> => {
    // Try to find user by email or username
    let email = identifier;
    if (!identifier.includes('@')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', identifier)
        .single();
      
      if (!profile) throw new Error('User not found');
      email = profile.email;
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw new Error('Invalid credentials');
    if (!authData.user) throw new Error('User not found');

    const profile = await profileService.getUserProfile(authData.user.id);
    if (!profile) throw new Error('Profile not found');

    return {
      id: profile.id,
      name: profile.full_name,
      email: profile.email,
      username: profile.username
    };
  }
};