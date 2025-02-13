import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "../integrations/supabase/client";

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
    
    console.log(response.data)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', response.data.user.id)
      .single();
    console.log("porofile",profile)
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
      // Check if email or username exists (Uncomment if you want this validation)
      /*
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
      */
  
      // Create auth user with retry logic
      let retryCount = 0;
      const maxRetries = 3;
      let signUpResponse;
  console.log(123123)
      while (retryCount < maxRetries) {
        try {
          // Attempt to sign up the user
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
          console.log(signUpResponse)
          // Check for sign-up errors
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
  
      console.log("signUpResponse", signUpResponse);
  
      // Insert user data into profiles table after successful signup
      const { data, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: signUpResponse.data.user?.id,
          created_at: new Date().toISOString(),
          username: signUpResponse.data.user?.user_metadata?.username,
          full_name: signUpResponse.data.user?.user_metadata?.full_name,
          avatar_url: '',
          is_admin: false,
          rating: 0,
          shipping_address: null,
          payment_setup: false,
          onboarding_completed: false,
          email: signUpResponse.data.user?.email
        }])
        .select()
        .single();
  
      if (profileError) {
        throw new Error('Failed to save profile: ' + profileError.message);
      }
  
      console.log("Profile data saved:", data);
      addNotification('success', 'Account created successfully! Please verify your email.');
      // Redirect or navigate to another page if needed
      // navigate('/');
  
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
    console.log("email,password",email, password)
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