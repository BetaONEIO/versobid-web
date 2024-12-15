import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { validateField } from '../../../utils/validation/authValidation';
import { SignInFormData, FormErrors } from './types';

export const useSignInForm = () => {
  const { login, isLoading, error: authError } = useAuth();
  const [formData, setFormData] = useState<SignInFormData>({
    identifier: '',
    password: '',
    captchaValid: false,
  });

  const [errors, setErrors] = useState<FormErrors>({
    identifier: null,
    password: null,
    captcha: null,
  });

  const handleChange = (field: keyof SignInFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({
      ...prev,
      [field]: validateField(field, value),
    }));
  };

  const handleCaptchaChange = (isValid: boolean) => {
    setFormData(prev => ({ ...prev, captchaValid: isValid }));
    setErrors(prev => ({
      ...prev,
      captcha: isValid ? null : 'Please complete the security check'
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: FormErrors = {
      identifier: validateField('identifier', formData.identifier),
      password: validateField('password', formData.password),
      captcha: formData.captchaValid ? null : 'Please complete the security check'
    };

    setErrors(newErrors);

    // Check if there are any errors
    if (Object.values(newErrors).some(error => error !== null)) {
      return;
    }

    try {
      await login(formData.identifier, formData.password);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return {
    formData,
    errors,
    isLoading,
    authError,
    handleChange,
    handleCaptchaChange,
    handleSubmit,
  };
};