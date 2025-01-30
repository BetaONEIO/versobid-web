import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthFormData } from '../types';
import { authService } from '../services/auth/authService';
import { useUser } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext';

export const useAuth = () => {
  const navigate = useNavigate();
  const { login: userLogin } = useUser();
  const { addNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await authService.login(identifier, password);
      userLogin(user);
      addNotification('success', 'Successfully signed in!');
      navigate('/');
    } catch (err) {
      setError('Invalid credentials');
      addNotification('error', 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (formData: AuthFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await authService.signup(formData);
      userLogin(user);
      addNotification('success', 'Account created successfully!');
      navigate('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create account';
      setError(message);
      addNotification('error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    signup,
    isLoading,
    error
  };
};