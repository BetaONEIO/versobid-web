import { supabase } from '../../lib/supabase';
import { AuthFormData } from '../../types/auth';
import { User } from '../../types/user';

export const authService = {
  async signup(formData: AuthFormData): Promise<User> {
    try {
      // Basic validation
      if (!formData.email || !formData.password || !formData.username) {
        throw new Error('Missing required fields');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Invalid email format');
      }

      // Validate username format
      const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
      if (!usernameRegex.test(formData.username)) {
        throw new Error('Username must be 3-30 characters and contain only letters, numbers, and underscores');
      }

      // Sign up with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            full_name: formData.name || formData.username
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('No user data returned from signup');

      // Return user data
      return {
        id: authData.user.id,
        email: formData.email,
        username: formData.username,
        name: formData.name || formData.username,
        is_admin: false,
        email_verified: false,
        shipping_address: null,
        payment_setup: false,
        onboarding_completed: false
      };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  async login(email: string, password: string): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user data returned');

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      return {
        id: data.user.id,
        email: data.user.email!,
        username: profile.username,
        name: profile.full_name,
        is_admin: profile.is_admin || false,
        email_verified: data.user.email_confirmed_at !== null,
        shipping_address: profile.shipping_address,
        payment_setup: profile.payment_setup,
        onboarding_completed: profile.onboarding_completed
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
};