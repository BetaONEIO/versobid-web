export const handleLoginError = (error: unknown): Error => {
  console.error('Login error:', error);
  if (error instanceof Error) {
    return error;
  }
  return new Error('Failed to sign in');
};

export const handleSignupError = (error: unknown): Error => {
  console.error('Signup error:', error);
  if (error instanceof Error) {
    return error;
  }
  return new Error('Failed to create account');
};