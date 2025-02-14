export const validateAuthData = (email: string, password: string) => {
  const errors: string[] = [];
  
  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');
  
  return errors;
};

export const validateSignupData = (email: string, username: string) => {
  const errors: string[] = [];
  
  if (!email) errors.push('Email is required');
  if (!username) errors.push('Username is required');
  
  return errors;
};