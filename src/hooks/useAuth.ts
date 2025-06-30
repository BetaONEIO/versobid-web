import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "../lib/supabase";
import { useUser } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext';
import { AuthFormData } from '../types/auth';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login: loginUser } = useUser();
  const { addNotification } = useNotification();

  const handleAuthResponse = async (response: any) => {
    if (response.error) {
      console.error('Auth response error:', response.error);
      throw new Error(response.error.message || 'Authentication failed');
    }

    if (!response.data?.user?.id) {
      console.error('Invalid auth response:', response);
      throw new Error('Invalid user data returned');
    }

    try {
      // Simple profile fetch without retry logic
      console.log('Fetching user profile...');
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, email, username, full_name, is_admin, shipping_address, payment_setup, onboarding_completed')
        .eq('id', response.data.user.id)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        throw new Error('Failed to fetch user profile');
      }

      if (!profile) {
        throw new Error('User profile not found');
      }

      console.log('Profile fetched successfully:', {
        id: profile.id,
        username: profile.username,
        email: response.data.user.email
      });

      return {
        id: response.data.user.id,
        email: response.data.user.email!,
        username: profile.username,
        name: profile.full_name,
        is_admin: profile.is_admin || false,
        email_verified: response.data.user.email_confirmed_at !== null,
        shipping_address: profile.shipping_address,
        payment_setup: profile.payment_setup,
        onboarding_completed: profile.onboarding_completed
      };
    } catch (error) {
      console.error('Profile processing error:', error);
      throw new Error('Failed to load user profile. Please try again.');
    }
  };

  const signup = async (formData: AuthFormData) => {
    setIsLoading(true);
    setError(null);
  
    try {
      if (!formData.email || !formData.password || !formData.username) {
        throw new Error('Please fill in all required fields');
      }

      console.log('Starting signup process...');
      const signUpResponse = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            full_name: formData.name || formData.username,
          }
        }
      });
      
      if (signUpResponse.error) {
        if (signUpResponse.error.message.includes('already registered')) {
          throw new Error('Email already registered');
        }
        throw new Error(signUpResponse.error.message);
      }

      console.log('Signup successful');
      addNotification('success', 'Account created successfully! Please verify your email.');
      navigate('/signin');
  
    } catch (error) {
      console.error('Signup error:', error);
      const message = error instanceof Error ? error.message : 'Failed to create account';
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
      if (!email || !password) {
        throw new Error('Please enter your email and password');
      }

      console.log('Starting login process...');
      const response = await supabase.auth.signInWithPassword({
        email,
        password
      });
    
      console.log('Auth response received, processing...');
      const user = await handleAuthResponse(response);
      
      console.log('Login successful, updating state...');
      loginUser(user);
      
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
      const message = error instanceof Error 
        ? error.message 
        : 'Failed to sign in. Please check your credentials and try again.';
      setError(message);
      addNotification('error', message);
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!email) {
        throw new Error('Please enter your email address');
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        throw error;
      }

      addNotification('success', 'Password reset email sent! Check your inbox.');
    } catch (error) {
      console.error('Password reset error:', error);
      const message = error instanceof Error ? error.message : 'Failed to send reset email';
      setError(message);
      addNotification('error', message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (newPassword: string) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!newPassword) {
        throw new Error('Please enter a new password');
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      addNotification('success', 'Password updated successfully!');
      navigate('/signin');
    } catch (error) {
      console.error('Password reset error:', error);
      const message = error instanceof Error ? error.message : 'Failed to update password';
      setError(message);
      addNotification('error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    signup,
    login,
    forgotPassword,
    resetPassword
  };
};