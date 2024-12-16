import { validateName, validateUsername, validateEmail, validatePassword } from './auth';

export const validateField = (field: string, value: string): string | null => {
  switch (field) {
    case 'name':
      return validateName(value);
    case 'username':
      return validateUsername(value);
    case 'email':
      return validateEmail(value);
    case 'password':
      return validatePassword(value);
    default:
      return null;
  }
};