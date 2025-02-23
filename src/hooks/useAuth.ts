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

  const checkProfileTrigger = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('auth_errors')
        .select('error')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error checking profile trigger:', error);
        return false;
      }

      // If we find an error, the trigger failed
      return !data;
    } catch (error) {
      console.error('Error in checkProfileTrigger:', error);
      return false;
    }
  };

  const fetchProfile = async (userId: string, attempt: number = 1): Promise<any> => {
    const maxAttempts = 20;
    const baseDelay = 2000;
    const maxDelay = 15000;

    try {
      console.log(`Attempting to fetch profile for user ${userId} (attempt ${attempt}/${maxAttempts})`);
      
      // Check if the trigger completed successfully
      if (attempt === 1) {
        const triggerSuccess = await checkProfileTrigger(userId);
        if (!triggerSuccess) {
          console.error('Profile creation trigger failed');
          throw new Error('Failed to create user profile');
        }
      }

      // First check if the user exists in auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Auth user not found:', authError);
        throw new Error('Authentication error');
      }

      // Try to fetch the profile with a more specific query and single row response
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, username, full_name, is_admin, shipping_address, payment_setup, onboarding_completed')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116' || error.code === 'PGRST012') {
          if (attempt < maxAttempts) {
            const delay = Math.min(baseDelay * Math.pow(1.5, attempt - 1), maxDelay);
            console.log(`Profile not found, retrying in ${delay}ms... (attempt ${attempt}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchProfile(userId, attempt + 1);
          }
          throw new Error('Profile creation timeout - please try logging in again');
        }
        throw error;
      }

      if (!data) {
        if (attempt < maxAttempts) {
          const delay = Math.min(baseDelay * Math.pow(1.5, attempt - 1), maxDelay);
          console.log(`No profile data, retrying in ${delay}ms... (attempt ${attempt}/${maxAttempts})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchProfile(userId, attempt + 1);
        }
        throw new Error('Profile not found after maximum attempts');
      }

      console.log('Profile found:', { id: data.id, username: data.username });
      return data;
    } catch (error) {
      console.error(`Profile fetch failed (attempt ${attempt}):`, error);
      
      if (attempt < maxAttempts) {
        const delay = Math.min(baseDelay * Math.pow(1.5, attempt - 1), maxDelay);
        console.log(`Error occurred, retrying in ${delay}ms... (attempt ${attempt}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchProfile(userId, attempt + 1);
      }
      
      throw error;
    }
  };

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
      // Wait for initial profile creation
      console.log('Waiting for profile creation...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Try to fetch profile
      console.log('Attempting to fetch profile...');
      const profile = await fetchProfile(response.data.user.id);

      if (!profile) {
        console.error('No profile returned after successful fetch');
        throw new Error('Failed to fetch user profile');
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
      console.error('Profile fetch error:', error);
      throw new Error('Failed to load user profile. Please try logging in again in a moment.');
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
      let retryCount = 0;
      const maxRetries = 3;
      let signUpResponse;

      while (retryCount < maxRetries) {
        try {
          console.log(`Signup attempt ${retryCount + 1}/${maxRetries}`);
          signUpResponse = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
              data: {
                username: formData.username,
                full_name: formData.name || formData.username,
              }
            }
          });
          
          if (!signUpResponse.error) {
            console.log('Signup successful');
            break;
          }
  
          if (signUpResponse.error.message.includes('already registered')) {
            throw new Error('Email already registered');
          }
  
          console.log(`Signup failed, retrying... (${retryCount + 1}/${maxRetries})`);
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        } catch (error) {
          if (error instanceof Error && error.message.includes('already registered')) {
            throw error;
          }
          if (retryCount === maxRetries - 1) throw error;
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        }
      }
  
      if (!signUpResponse || signUpResponse.error) {
        throw new Error('Failed to create account after multiple attempts');
      }
  
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

  return {
    isLoading,
    error,
    signup,
    login
  };
};