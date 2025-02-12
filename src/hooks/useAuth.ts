import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext';
import { AuthFormData } from '../types/auth';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login: loginUser } = useUser();
  const { addNotification } = useNotification();

  const checkExistingUser = async (email: string, username: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email, username')
        .or(`email.eq.${email},username.eq.${username}`)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error checking existing user:', error);
      return null;
    }
  };

  const waitForProfile = async (userId: string, maxAttempts = 15): Promise<any> => {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          return data;
        }
      } catch (error) {
        console.warn(`Attempt ${i + 1}/${maxAttempts} failed:`, error);
      }

      // Exponential backoff with jitter
      const delay = Math.min(1000 * Math.pow(2, i) + Math.random() * 1000, 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    throw new Error('Profile creation timed out. Please try again.');
  };

  const signup = async (formData: AuthFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Basic validation
      if (!formData.email || !formData.password || !formData.username) {
        throw new Error('All fields are required');
      }

      // Check for existing user
      const existingUser = await checkExistingUser(formData.email, formData.username);
      
      if (existingUser) {
        if (existingUser.email === formData.email) {
          throw new Error('Email already exists');
        }
        if (existingUser.username === formData.username) {
          throw new Error('Username already taken');
        }
      }

      // Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            full_name: formData.name || formData.username
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('Database error')) {
          throw new Error('Unable to create account. Please try again in a few moments.');
        }
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error('No user data returned');
      }

      // Wait for profile to be created
      const profile = await waitForProfile(authData.user.id);

      // Login the user
      const user = {
        id: authData.user.id,
        email: authData.user.email!,
        username: profile.username,
        name: profile.full_name,
        is_admin: false,
        email_verified: false,
        shipping_address: null,
        payment_setup: false,
        onboarding_completed: false
      };

      loginUser(user);
      addNotification('success', 'Account created successfully! Please check your email to verify your account.');
      navigate('/');
    } catch (error) {
      console.error('Signup error:', error);
      const message = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred. Please try again.';
      setError(message);
      addNotification('error', message);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user data returned');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError) {
        throw new Error('Failed to fetch profile');
      }

      if (!profile) {
        throw new Error('Profile not found');
      }

      const user = {
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

      loginUser(user);
      
      // Check for intended route
      const intendedRoute = localStorage.getItem('intendedRoute');
      if (intendedRoute) {
        localStorage.removeItem('intendedRoute');
        navigate(intendedRoute);
      } else {
        navigate('/');
      }
      
      addNotification('success', 'Signed in successfully!');
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign in');
      addNotification('error', 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    signup,
    login
  };
};