import { ProfileInsert } from './types';
import { PROFILE_ERRORS, PROFILE_CONSTRAINTS } from './constants';
import { isValidUsername, isValidName } from './utils';

export const validateProfileData = (profile: Partial<ProfileInsert>): string[] => {
  const errors: string[] = [];

  if (!profile.id) {
    errors.push(PROFILE_ERRORS.MISSING_ID);
  }

  if (!profile.email) {
    errors.push(PROFILE_ERRORS.MISSING_EMAIL);
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
    errors.push('Invalid email format');
  }

  if (!profile.username) {
    errors.push(PROFILE_ERRORS.MISSING_USERNAME);
  } else if (!isValidUsername(profile.username)) {
    errors.push(`Username must be ${PROFILE_CONSTRAINTS.USERNAME_MIN_LENGTH}-${PROFILE_CONSTRAINTS.USERNAME_MAX_LENGTH} characters and contain only letters, numbers, underscores, and hyphens`);
  }

  if (!profile.full_name) {
    errors.push(PROFILE_ERRORS.MISSING_NAME);
  } else if (!isValidName(profile.full_name)) {
    errors.push(`Name must be ${PROFILE_CONSTRAINTS.NAME_MIN_LENGTH}-${PROFILE_CONSTRAINTS.NAME_MAX_LENGTH} characters and contain only letters, spaces, hyphens, and apostrophes`);
  }

  return errors;
};

export const validateProfileUpdate = (updates: Partial<ProfileInsert>): string[] => {
  const errors: string[] = [];

  if (updates.username && !isValidUsername(updates.username)) {
    errors.push(`Username must be ${PROFILE_CONSTRAINTS.USERNAME_MIN_LENGTH}-${PROFILE_CONSTRAINTS.USERNAME_MAX_LENGTH} characters and contain only letters, numbers, underscores, and hyphens`);
  }

  if (updates.full_name && !isValidName(updates.full_name)) {
    errors.push(`Name must be ${PROFILE_CONSTRAINTS.NAME_MIN_LENGTH}-${PROFILE_CONSTRAINTS.NAME_MAX_LENGTH} characters and contain only letters, spaces, hyphens, and apostrophes`);
  }

  if (updates.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
    errors.push('Invalid email format');
  }

  return errors;
};