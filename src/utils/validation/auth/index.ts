import { validateName } from './nameValidation';
import { validateUsername } from './usernameValidation';
import { validateEmail } from './emailValidation';
import { validatePassword } from './passwordValidation';

export {
  validateName,
  validateUsername,
  validateEmail,
  validatePassword
};

export const validateField = (field: string, value: string): string | null => {
  const validations = {
    name: validateName,
    username: validateUsername,
    email: validateEmail,
    password: validatePassword
  };

  return validations[field as keyof typeof validations]?.(value) ?? null;
};