import { supabase } from '../../lib/supabase';
import { AuthFormData, User } from '../../types';
import { profileService } from '../profileService';
import { emailService } from '../emailService';
import { AuthServiceInterface } from './types';

class AuthService implements AuthServiceInterface {
  async login(identifier: string, password: string): Promise<User> {
    try {
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
        username: profile.username
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async signup(formData: AuthFormData): Promise<User> {
    try {
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
        username: formData.username,
        full_name: formData.name,
        created_at: new Date().toISOString(),
        avatar_url: null,
      });

      // Send welcome email
      await emailService.sendWelcomeEmail(formData.email, formData.name);

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
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;

      await emailService.sendPasswordResetEmail(email, 'reset-token');
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();