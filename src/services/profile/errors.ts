// src/services/profile/errors.ts

export const ERROR_MESSAGES = {
  PROFILE_NOT_FOUND: (userId: string): string => `Profile not found for user ${userId}`,
  VALIDATION_FAILED: (errors: string[]): string =>
    `Profile validation failed: ${errors.join(', ')}`,
  USERNAME_REQUIRED: 'Username is required',
  EMAIL_REQUIRED: 'Email is required',
  FULL_NAME_REQUIRED: 'Full name is required',
} as const;

// Custom error classes
export class ProfileNotFoundError extends Error {
  constructor(userId: string) {
    super(ERROR_MESSAGES.PROFILE_NOT_FOUND(userId));
    this.name = 'ProfileNotFoundError';
  }
}

export class ValidationFailedError extends Error {
  constructor(errors: string[]) {
    super(ERROR_MESSAGES.VALIDATION_FAILED(errors));
    this.name = 'ValidationFailedError';
  }
}