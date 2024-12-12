import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validateEmail, validateUsername, validatePassword } from '../utils/validation';

interface FormData {
  identifier: string;
  password: string;
}

interface FormErrors {
  identifier: string | null;
  password: string | null;
}

export const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    identifier: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({
    identifier: null,
    password: null,
  });

  const validateIdentifier = (value: string): string | null => {
    if (value.includes('@')) {
      return validateEmail(value);
    }
    return validateUsername(value);
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    setErrors(prev => ({
      ...prev,
      [field]: field === 'identifier' ? validateIdentifier(value) : validatePassword(value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FormErrors = {
      identifier: validateIdentifier(formData.identifier),
      password: validatePassword(formData.password)
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(error => error !== null)) {
      return;
    }

    await login(formData.identifier, formData.password);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Sign In</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email or Username
            </label>
            <input
              type="text"
              value={formData.identifier}
              onChange={(e) => handleChange('identifier', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
            {errors.identifier && (
              <p className="mt-1 text-sm text-red-600">{errors.identifier}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};