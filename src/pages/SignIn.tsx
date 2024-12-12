import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const { login, isLoading, error: authError } = useAuth();
  const [isEmailLogin, setIsEmailLogin] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    identifier: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({
    identifier: null,
    password: null,
  });

  const redirectPath = location.state?.from?.pathname || '/';

  const validateIdentifier = (value: string): string | null => {
    if (isEmailLogin) {
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
    navigate(redirectPath, { replace: true });
  };

  // Rest of the component remains the same...
};