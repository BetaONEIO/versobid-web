import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthFormData } from '../types';
import { AuthService } from '../services/auth';
import { useUser } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext';

const authService = new AuthService();

export const useAuth = () => {
  const navigate = useNavigate();
  const { login: userLogin } = useUser();
  const { addNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (identifier: string, password: string, captchaToken?: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await authService.login(identifier, password, captchaToken);
      userLogin(user);
      addNotification('success', 'Successfully signed in!');
      navigate('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign in';
      setError(message);
      addNotification('error', message);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (formData: AuthFormData): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await authService.signup(formData);
      userLogin(user);
      addNotification('success', 'Account created successfully! Welcome to VersoBid.');
      navigate('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create account';
      setError(message);
      addNotification('error', message);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (email: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.requestPasswordReset(email);
      addNotification('success', 'Password reset instructions have been sent to your email.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to request password reset';
      setError(message);
      addNotification('error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    signup,
    requestPasswordReset,
    isLoading,
    error
  };
};