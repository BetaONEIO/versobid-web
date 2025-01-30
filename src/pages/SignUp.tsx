import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthFormData } from '../types';
import { useNotification } from '../contexts/NotificationContext';
import { userService } from '../services/userService';
import { TermsModal } from '../components/ui/TermsModal';
import { PrivacyModal } from '../components/ui/PrivacyModal';
import { PasswordStrengthIndicator } from '../components/auth/PasswordStrengthIndicator';

export const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    username: '',
    name: '',
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await userService.signup(formData);
      addNotification('success', 'Account created successfully! Please check your email to verify your account.');
      navigate('/signin');
    } catch (error) {
      console.error('Signup error:', error);
      const message = error instanceof Error ? error.message : 'Failed to create account';
      addNotification('error', message);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.email.trim()) {
      addNotification('error', 'Email is required');
      return false;
    }

    if (!formData.username.trim()) {
      addNotification('error', 'Username is required');
      return false;
    }

    if (!formData.password) {
      addNotification('error', 'Password is required');
      return false;
    }

    if (!acceptedTerms) {
      addNotification('error', 'You must accept the Terms & Conditions and Privacy Policy');
      return false;
    }

    return true;
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create Account
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              onFocus={() => setPasswordTouched(true)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
            {passwordTouched && (
              <PasswordStrengthIndicator password={formData.password} />
            )}
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
              I agree to the{' '}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                Terms & Conditions
              </button>{' '}
              and{' '}
              <button
                type="button"
                onClick={() => setShowPrivacy(true)}
                className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                Privacy Policy
              </button>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                to="/signin"
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>

      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
      <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </div>
  );
};