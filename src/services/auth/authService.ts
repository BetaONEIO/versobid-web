import { supabase } from '../../lib/supabase';
import { AuthFormData, User } from '../../types';
import { profileService } from '../profileService';
import { emailService } from '../emailService';

export const authService = {
  signup: async (formData: AuthFormData): Promise<User> => {
    try {
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
        options: {
          data: {
            full_name: formData.name,
            username: formData.username
          }
        }
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
        avatar_url: null
      });

      // Send welcome email
      try {
        await emailService.sendWelcomeEmail(formData.email, formData.name || '');
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't throw here, as the signup was successful
      }

      return {
        id: profile.id,
        name: profile.full_name,
        email: profile.email,
        username: profile.username
      };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  // ... rest of the service
};