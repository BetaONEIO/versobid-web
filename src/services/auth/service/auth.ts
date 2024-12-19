import { supabase } from '../../../lib/supabase';
import { AuthFormData } from '../../../types';

export const resolveEmailFromIdentifier = async (identifier: string): Promise<string> => {
  if (identifier.includes('@')) return identifier;

  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('username', identifier)
    .single();
  
  if (!profile) throw new Error('User not found');
  return profile.email;
};

export const authenticateUser = async (email: string, password: string, captchaToken?: string) => {
  if (!captchaToken) {
    throw new Error('Please complete the security check');
  }

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: { captchaToken }
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('User not found');

  return authData;
};

export const createAuthUser = async (formData: AuthFormData) => {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        full_name: formData.name,
        username: formData.username
      },
      captchaToken: formData.captchaToken
    }
  });

  if (authError) throw authError;
  return authData;
};