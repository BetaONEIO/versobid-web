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

  const handleAuthResponse = async (response: any) => {
    if (response.error) {
      throw response.error;
    }

    if (!response.data?.user) {
      throw new Error('No user data returned');
    }

    // Wait for the trigger to complete
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', response.data.user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Failed to fetch profile');
    }

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
  };

  const signup = async (formData: AuthFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if email or username exists
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('email, username')
        .or(`email.eq.${formData.email},username.eq.${formData.username}`)
        .maybeSingle();

      if (checkError) {
        throw new Error('Failed to check existing user');
      }

      if (existingUser) {
        if (existingUser.email === formData.email) {
          throw new Error('Email already exists');
        }
        if (existingUser.username === formData.username) {
          throw new Error('Username already taken');
        }
      }

      // Create auth user with retry logic
      let retryCount = 0;
      const maxRetries = 3;
      let signUpResponse;

      while (retryCount < maxRetries) {
        try {
          signUpResponse = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
              data: {
                username: formData.username,
                full_name: formData.name || formData.username
              }
            }
          });

          if (!signUpResponse.error) break;

          if (signUpResponse.error.message.includes('already registered')) {
            throw new Error('Email already registered');
          }

          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        } catch (error) {
          if (error instanceof Error && error.message.includes('already registered')) {
            throw error;
          }
          if (retryCount === maxRetries - 1) throw error;
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }

      if (!signUpResponse || signUpResponse.error) {
        throw new Error('Failed to create account after multiple attempts');
      }

      // Wait for profile creation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const user = await handleAuthResponse(signUpResponse);
      loginUser(user);
      addNotification('success', 'Account created successfully! Please verify your email.');
      navigate('/');
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
      const response = await supabase.auth.signInWithPassword({
        email,
        password
      });

      const user = await handleAuthResponse(response);
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