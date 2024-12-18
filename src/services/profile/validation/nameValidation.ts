import { VALIDATION_RULES } from '../constants/validationRules';

export const validateName = (name: string): string | null => {
  if (!name.trim()) {
    return 'Name is required';
  }
  if (name.length < VALIDATION_RULES.NAME.MIN_LENGTH) {
    return `Name must be at least ${VALIDATION_RULES.NAME.MIN_LENGTH} characters`;
  }
  if (!VALIDATION_RULES.NAME.PATTERN.test(name)) {
    return 'Name can only contain letters, spaces, hyphens, and apostrophes';
  }
  return null;
};