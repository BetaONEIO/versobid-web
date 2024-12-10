import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthFormData } from '../types';
import { useUser } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext';
import { validateEmail, validateUsername, validatePassword } from '../utils/validation';

interface FormErrors {
  identifier: string | null;
  password: string | null;
}

export const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useUser();
  const { addNotification } = useNotification();
  const [isEmailLogin, setIsEmailLogin] = useState(true);
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({
    identifier: null,
    password: null,
  });

  const from = location.state?.from?.pathname || '/';

  const validateIdentifier = (value: string): string | null => {
    if (isEmailLogin) {
      return validateEmail(value);
    }
    return validateUsername(value);
  };

  const handleChange = (field: 'identifier' | 'password', value: string) => {
    setFormData(prev => ({
      ...prev,
      [isEmailLogin ? 'email' : 'username']: field === 'identifier' ? value : prev.email,
      password: field === 'password' ? value : prev.password,
    }));
    setErrors(prev => ({
      ...prev,
      [field]: field === 'identifier' ? validateIdentifier(value) : validatePassword(value),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const identifierValue = isEmailLogin ? formData.email : formData.username;
    const newErrors: FormErrors = {
      identifier: validateIdentifier(identifierValue || ''),
      password: validatePassword(formData.password),
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(error => error !== null)) {
      return;
    }

    try {
      // Mock login for demonstration
      login({
        id: '1',
        name: 'Test User',
        email: formData.email,
        username: formData.username || '',
        bids: []
      });
      addNotification('success', 'Successfully signed in!');
      navigate(from, { replace: true });
    } catch (error) {
      addNotification('error', 'Failed to sign in. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
            Or{' '}
            <Link
              to="/signup"
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              create a new account
            </Link>
          </p>
        </div>
        <div className="flex justify-center space-x-4 mb-4">
          <button
            type="button"
            onClick={() => setIsEmailLogin(true)}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              isEmailLogin
                ? 'bg-indigo-600 text-white'
                : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700'
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => setIsEmailLogin(false)}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              !isEmailLogin
                ? 'bg-indigo-600 text-white'
                : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700'
            }`}
          >
            Username
          </button>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {isEmailLogin ? 'Email address' : 'Username'}
              </label>
              <input
                id="identifier"
                name="identifier"
                type={isEmailLogin ? 'email' : 'text'}
                autoComplete={isEmailLogin ? 'email' : 'username'}
                required
                className={`mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border ${
                  errors.identifier ? 'border-red-300' : 'border-gray-300'
                } dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder={isEmailLogin ? 'Email address' : 'Username'}
                value={isEmailLogin ? formData.email : formData.username}
                onChange={(e) => handleChange('identifier', e.target.value)}
              />
              {errors.identifier && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.identifier}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                } dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};