import { DbProfile } from '../../types/supabase';
import { ERROR_MESSAGES } from './constants/errorMessages';
import { VALIDATION_RULES } from './constants/validationRules';

export const validateProfileData = (profile: Partial<DbProfile>): string[] => {
  const errors: string[] = [];

  if (!profile.username?.trim()) {
    errors.push(ERROR_MESSAGES.USERNAME_REQUIRED);
  } else if (profile.username.length < VALIDATION_RULES.USERNAME.MIN_LENGTH) {
    errors.push(`Username must be at least ${VALIDATION_RULES.USERNAME.MIN_LENGTH} characters`);
  }

  if (!profile.email?.trim()) {
    errors.push(ERROR_MESSAGES.EMAIL_REQUIRED);
  }

  if (!profile.full_name?.trim()) {
    errors.push(ERROR_MESSAGES.FULL_NAME_REQUIRED);
  }

  return errors;
};