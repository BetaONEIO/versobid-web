import React from 'react';
import { SignUpForm } from '../components/auth/SignUpForm';

export const SignUp: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <SignUpForm />
    </div>
  );
};