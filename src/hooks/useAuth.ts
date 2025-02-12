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

    // Wait a moment for the trigger to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

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
      // Check if email or username exists using parameterized query
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('email, username')
        .or(`email.eq."${formData.email}",username.eq."${formData.username}"`)
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

      // Create auth user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            full_name: formData.name || formData.username
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error('No user data returned');

      // Wait for profile creation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verify profile was created
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Failed to create profile');
      }

      // Login the user
      const user = {
        id: data.user.id,
        email: data.user.email!,
        username: profile.username,
        name: profile.full_name,
        is_admin: false,
        email_verified: false,
        shipping_address: null,
        payment_setup: false,
        onboarding_completed: false
      };

      loginUser(user);
      addNotification('success', 'Account created successfully!');
      navigate('/');
    } catch (err) {
      console.error('Signup error:', err);
      const message = err instanceof Error ? err.message : 'Failed to create account';
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
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in');
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