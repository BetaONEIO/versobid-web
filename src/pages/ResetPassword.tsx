import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { PasswordStrengthIndicator } from '../components/auth/PasswordStrengthIndicator';
import { validatePassword } from '../utils/validation';
import { supabase } from '../lib/supabase';
import { useNotification } from '../contexts/NotificationContext';

export const ResetPassword: React.FC = () => {
  const { resetPassword, isLoading, error } = useAuth();
  const { addNotification } = useNotification();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyResetSession = async () => {
      try {
        // Check if we have a token in the URL (from email link)
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        console.log('token', token);
        console.log('type', type);

        if (type === 'recovery' && token) {
          // Use the token to set session
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'recovery'
          });

          if (error) {
            console.error('Session error:', error);
            setIsValidSession(false);
          } else {
            console.log('Valid reset session established');
            setIsValidSession(true);
          }
        } else {
          // Check if we already have a valid session
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setIsValidSession(true);
          } else {
            setIsValidSession(false);
          }
        }
      } catch (error) {
        console.error('Error verifying reset session:', error);
        setIsValidSession(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyResetSession();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      addNotification('error', 'Passwords do not match');
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      addNotification('error', passwordError);
      return;
    }

    await resetPassword(password);
  };

  const passwordsMatch = password === confirmPassword;
  const passwordError = validatePassword(password);
  const canSubmit = passwordTouched && !passwordError && passwordsMatch && password.length > 0;

  // Show loading while verifying session
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Verifying reset link...
          </h2>
        </div>
      </div>
    );
  }

  // Show error if session is invalid
  if (isValidSession === false) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Invalid Reset Link
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="inline-block px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Set New Password
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Enter your new password below. Make sure it's strong and secure.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordTouched(true);
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
              placeholder="Enter your new password"
              required
            />
            {passwordTouched && (
              <PasswordStrengthIndicator password={password} />
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
              placeholder="Confirm your new password"
              required
            />
            {confirmPassword && !passwordsMatch && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                Passwords do not match
              </p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !canSubmit}
            className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Remember your password?{' '}
            <Link
              to="/signin"
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}; 