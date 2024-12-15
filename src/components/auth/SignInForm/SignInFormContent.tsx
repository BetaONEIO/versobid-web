import React from 'react';
import { Link } from 'react-router-dom';
import { FormField } from '../../ui/FormField';
import { ErrorMessage } from '../../ui/ErrorMessage';
import { HCaptchaComponent } from '../../ui/HCaptcha';
import { SignInFormContentProps } from './types';

export const SignInFormContent: React.FC<SignInFormContentProps> = ({
  formData,
  errors,
  isLoading,
  authError,
  onChange,
  onCaptchaChange,
  onSubmit,
}) => {
  return (
    <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Sign In</h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            Sign up
          </Link>
        </p>
      </div>

      {authError && <ErrorMessage message={authError} />}

      <form onSubmit={onSubmit} className="space-y-6">
        <FormField
          id="identifier"
          label="Email or Username"
          type="text"
          value={formData.identifier}
          error={errors.identifier}
          disabled={isLoading}
          onChange={(value) => onChange('identifier', value)}
          required
        />

        <FormField
          id="password"
          label="Password"
          type="password"
          value={formData.password}
          error={errors.password}
          disabled={isLoading}
          onChange={(value) => onChange('password', value)}
          required
        />

        <HCaptchaComponent
          onChange={onCaptchaChange}
          error={errors.captcha}
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
};