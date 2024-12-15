import React from 'react';
import { SignInFormContent } from './SignInFormContent';
import { useSignInForm } from './useSignInForm';

export const SignInForm: React.FC = () => {
  const {
    formData,
    errors,
    isLoading,
    authError,
    handleChange,
    handleCaptchaChange,
    handleSubmit
  } = useSignInForm();

  return (
    <SignInFormContent
      formData={formData}
      errors={errors}
      isLoading={isLoading}
      authError={authError}
      onChange={handleChange}
      onCaptchaChange={handleCaptchaChange}
      onSubmit={handleSubmit}
    />
  );
};