import { supabase } from '../../../lib/supabase';
import { AuthFormData, User } from '../../../types';
import { emailService } from '../../email';
import { AuthServiceInterface } from '../types';
import { handleLoginError, handleSignupError } from './errorHandlers';
import { validateSignupData } from './validation';
import { createUserProfile } from './profile';
import { resolveEmailFromIdentifier, authenticateUser, createAuthUser } from './auth';
import { getUserProfile, checkExistingUsername } from './user';

export class AuthService implements AuthServiceInterface {
  async login(identifier: string, password: string, captchaToken?: string): Promise<User> {
    try {
      const email = await resolveEmailFromIdentifier(identifier);
      const authData = await authenticateUser(email, password, captchaToken);
      return await getUserProfile(authData.user.id);
    } catch (error) {
      throw handleLoginError(error);
    }
  }

  async signup(formData: AuthFormData): Promise<User> {
    try {
      validateSignupData(formData);
      await checkExistingUsername(formData.username);
      const authData = await createAuthUser(formData);
      if (!authData.user) {
        throw new Error('Failed to create user account');
      }
      const profile = await createUserProfile(authData.user.id, formData);
      await emailService.sendWelcomeEmail(formData.email, formData.name);
      return profile;
    } catch (error) {
      throw handleSignupError(error);
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