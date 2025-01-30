import { supabase } from '../../lib/supabase';
import { AuthService } from './types';
import { AuthUser, SupabaseAuthUser } from './types/user';
import { mapUserFromProfile } from './mappers/userMapper';
import { AuthFormData } from '../../types/auth';

export const authService: AuthService = {
  async login(identifier: string, password: string): Promise<AuthUser> {
    try {
      let email = identifier;
      
      if (!identifier.includes('@')) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', identifier)
          .maybeSingle();
        
        if (!profile?.email) {
          throw new Error('User not found');
        }
        email = profile.email;
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user data returned');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (profileError) throw new Error('Failed to load user profile');
      if (!profile) throw new Error('Profile not found');

      const supabaseUser = authData.user as SupabaseAuthUser;
      return mapUserFromProfile(profile, supabaseUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async signup(formData: AuthFormData): Promise<AuthUser> {
    try {
      // Create auth user first
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            full_name: formData.name
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('Failed to create user account');

      // Create profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: authData.user.id,
          email: formData.email,
          username: formData.username || '',
          full_name: formData.name || '',
          created_at: new Date().toISOString(),
          is_admin: false,
          avatar_url: null
        }])
        .select()
        .single();

      if (profileError) {
        // Clean up auth user if profile creation fails
        await supabase.auth.signOut();
        throw new Error('Failed to create profile');
      }

      const supabaseUser = authData.user as SupabaseAuthUser;
      return mapUserFromProfile(profile, supabaseUser);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  async requestPasswordReset(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }
};