import { VALIDATION_RULES } from '../constants/validationRules';

export const validateUsername = (username: string): string | null => {
  if (!username.trim()) {
    return 'Username is required';
  }
  if (username.length < VALIDATION_RULES.USERNAME.MIN_LENGTH) {
    return `Username must be at least ${VALIDATION_RULES.USERNAME.MIN_LENGTH} characters`;
  }
  if (!VALIDATION_RULES.USERNAME.PATTERN.test(username)) {
    return 'Username can only contain letters, numbers, underscores, and hyphens';
  }
  return null;
};