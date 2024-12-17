export const ERROR_MESSAGES = {
  PROFILE_NOT_FOUND: (userId: string) => `Profile not found for user ${userId}`,
  VALIDATION_FAILED: (errors: string[]) => `Profile validation failed: ${errors.join(', ')}`,
  UNAUTHORIZED: 'Unauthorized access',
  USERNAME_REQUIRED: 'Username is required',
  EMAIL_REQUIRED: 'Email is required',
  FULL_NAME_REQUIRED: 'Full name is required'
} as const;