import { supabase } from '../lib/supabase';
import { AuthFormData, User } from '../types';

export const userService = {
  async signup(formData: AuthFormData): Promise<User> {
    try {
      // First check if email or username exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email, username')
        .or(`email.eq.${formData.email},username.eq.${formData.username}`)
        .maybeSingle();

      if (existingUser) {
        if (existingUser.email === formData.email) {
          throw new Error('Email already exists');
        }
        if (existingUser.username === formData.username) {
          throw new Error('Username already taken');
        }
      }

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            full_name: formData.name
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Wait a short moment for the trigger to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Return the user data
      return {
        id: authData.user.id,
        name: formData.name || '',
        email: formData.email,
        username: formData.username || '',
        is_admin: false,
        email_verified: false
      };
    } catch (error) {
      console.error('Signup process error:', error);
      throw error;
    }
  }
};