import { supabase } from '../../lib/supabase';
import { AuthFormData, User } from '../../types';
import { profileService } from '../profileService';
import { emailService } from '../emailService';

export const authService = {
  // ... other methods ...

  async requestPasswordReset(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;

    try {
      // Instead of using generateResetToken, we'll use the resetPasswordForEmail response
      await emailService.sendPasswordResetEmail(email, 'reset-token');
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
};