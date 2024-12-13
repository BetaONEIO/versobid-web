import React from 'react';
import { SignUpFormContent } from './SignUpFormContent';
import { useSignUpForm } from './useSignUpForm';

export const SignUpForm: React.FC = () => {
  const {
    formData,
    errors,
    isLoading,
    authError,
    handleChange,
    handleSubmit
  } = useSignUpForm();

  return (
    <SignUpFormContent
      formData={formData}
      errors={errors}
      isLoading={isLoading}
      authError={authError}
      onChange={handleChange}
      onSubmit={handleSubmit}
    />
  );
};