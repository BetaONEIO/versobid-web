import { supabase } from '../../lib/supabase';
import { AuthFormData, User } from '../../types';
import { profileService } from '../profileService';
import { emailService } from '../emailService';

export const authService = {
  signup: async (formData: AuthFormData): Promise<User> => {
    // Check if username is taken
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', formData.username)
      .single();

    if (existingUser) {
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
      email: formData.email,
      username: formData.username || '',
      full_name: formData.name || '',
      created_at: new Date().toISOString(),
      avatar_url: null,
    });

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(formData.email, formData.name || '');
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }

    return {
      id: profile.id,
      name: profile.full_name,
      email: profile.email,
      username: profile.username,
      bids: []
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

    const profile = await profileService.getProfile(authData.user.id);
    if (!profile) throw new Error('Profile not found');

    return {
      id: profile.id,
      name: profile.full_name,
      email: profile.email,
      username: profile.username,
      bids: []
    };
  },

  async requestPasswordReset(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) throw error;

    try {
      await emailService.sendPasswordResetEmail(email, 'reset-token');
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
};