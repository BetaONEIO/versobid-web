import { useState } from 'react';
import { AuthFormData } from '../../../types';
import { useAuth } from '../../../hooks/useAuth';
import { validateField } from '../../../utils/validation/authValidation';
import { FormErrors } from './types';

export const useSignUpForm = () => {
  const { signup, isLoading, error: authError } = useAuth();
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    name: '',
    username: '',
    acceptedTerms: false,
    captchaToken: undefined,
  });

  const [errors, setErrors] = useState<FormErrors>({
    name: null,
    username: null,
    email: null,
    password: null,
    acceptedTerms: null,
    captcha: null,
  });

  const handleChange = (field: keyof AuthFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'acceptedTerms' ? value === 'true' : value
    }));

    if (field === 'acceptedTerms') {
      setErrors(prev => ({
        ...prev,
        acceptedTerms: value === 'true' ? null : 'You must accept the terms and conditions'
      }));
    } else {
      setErrors(prev => ({
        ...prev,
        [field]: validateField(field, value),
      }));
    }
  };

  const handleCaptchaChange = (token: string) => {
    setFormData(prev => ({ ...prev, captchaToken: token }));
    setErrors(prev => ({
      ...prev,
      captcha: token ? null : 'Please complete the security check'
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: FormErrors = {
      name: validateField('name', formData.name),
      username: validateField('username', formData.username),
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
      acceptedTerms: formData.acceptedTerms ? null : 'You must accept the terms and conditions',
      captcha: formData.captchaToken ? null : 'Please complete the security check'
    };

    setErrors(newErrors);

    // Check if there are any errors
    if (Object.values(newErrors).some(error => error !== null)) {
      return;
    }

    try {
      await signup(formData);
    } catch (error) {
      console.error('Signup error:', error);
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