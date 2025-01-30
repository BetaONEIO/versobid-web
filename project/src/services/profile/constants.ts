export const PROFILE_ERRORS = {
  MISSING_ID: 'User ID is required',
  MISSING_EMAIL: 'Email is required',
  MISSING_USERNAME: 'Username is required',
  MISSING_NAME: 'Full name is required',
  DUPLICATE_EMAIL: 'Email already exists',
  DUPLICATE_USERNAME: 'Username already exists',
  CREATION_FAILED: 'Failed to create profile',
  UPDATE_FAILED: 'Failed to update profile',
  NOT_FOUND: 'Profile not found',
  INVALID_DATA: 'Invalid profile data'
} as const;

export const PROFILE_CONSTRAINTS = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  USERNAME_PATTERN: /^[a-zA-Z0-9_-]+$/,
  NAME_PATTERN: /^[a-zA-Z\s'-]+$/
} as const;

export type ProfileErrorCode = keyof typeof PROFILE_ERRORS;
export type ProfileConstraintKey = keyof typeof PROFILE_CONSTRAINTS;