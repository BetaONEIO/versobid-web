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

      // Check if email exists
      const { data: emailExists } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', formData.email)
        .maybeSingle();

      if (emailExists) {
        throw new Error('Email already exists');
      }

      // Check if username exists
      const { data: usernameExists } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', formData.username)
        .maybeSingle();

      if (usernameExists) {
        throw new Error('Username already taken');
      }

      // Get the current origin for the redirect URL
      const redirectTo = new URL('/auth/callback', window.location.origin).toString();

      // Sign up with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            full_name: formData.name || formData.username
          },
          emailRedirectTo: redirectTo
        }
      });

      if (signUpError) {
        console.error('Auth signup error:', signUpError);
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error('No user data returned from signup');
      }

      // Wait for profile creation with retries
      let profile = null;
      let attempts = 0;
      const maxAttempts = 5;
      const initialDelay = 500; // Start with 500ms

      while (attempts < maxAttempts) {
        const delay = initialDelay * Math.pow(2, attempts); // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (error) {
          console.warn(`Attempt ${attempts + 1} failed:`, error);
        } else if (data) {
          profile = data;
          break;
        }

        attempts++;
      }

      if (!profile) {
        throw new Error('Failed to create profile after multiple attempts');
      }

      // Return user data
      return {
        id: authData.user.id,
        email: formData.email,
        username: formData.username,
        name: formData.name || formData.username,
        is_admin: false,
        email_verified: false
      };
    } catch (error) {
      console.error('Signup error:', error);
      
      // Enhance error messages for better user feedback
      if (error instanceof Error) {
        if (error.message.includes('Database error saving new user')) {
          throw new Error('Unable to create account. Please try again in a few moments.');
        }
        throw error;
      }
      
      throw new Error('Failed to create account. Please try again.');
    }
  },

  async login(identifier: string, password: string): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: identifier,
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
        email_verified: data.user.email_verified || false
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
};