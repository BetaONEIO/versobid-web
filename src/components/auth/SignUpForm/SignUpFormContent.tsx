import React from 'react';
import { Link } from 'react-router-dom';
import { FormField } from '../../ui/FormField';
import { ErrorMessage } from '../../ui/ErrorMessage';
import { SignUpFormContentProps } from './types';

export const SignUpFormContent: React.FC<SignUpFormContentProps> = ({
  formData,
  errors,
  isLoading,
  authError,
  onChange,
  onSubmit,
}) => {
  return (
    <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
          Already have an account?{' '}
          <Link
            to="/signin"
            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            Sign in
          </Link>
        </p>
      </div>

      {authError && <ErrorMessage message={authError} />}

      <form className="mt-8 space-y-6" onSubmit={onSubmit}>
        <div className="rounded-md shadow-sm space-y-4">
          <FormField
            id="name"
            label="Full name"
            type="text"
            value={formData.name || ''}
            error={errors.name}
            disabled={isLoading}
            onChange={(value) => onChange('name', value)}
            required
          />

          <FormField
            id="username"
            label="Username"
            type="text"
            value={formData.username || ''}
            error={errors.username}
            disabled={isLoading}
            onChange={(value) => onChange('username', value)}
            required
          />

          <FormField
            id="email"
            label="Email address"
            type="email"
            value={formData.email}
            error={errors.email}
            disabled={isLoading}
            onChange={(value) => onChange('email', value)}
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
            helperText="Must be 6-20 characters with at least one uppercase letter, number, and special character"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </div>
  );
};