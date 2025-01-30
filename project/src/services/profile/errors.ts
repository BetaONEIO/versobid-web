export class ProfileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProfileError';
  }
}

export class ProfileNotFoundError extends ProfileError {
  constructor(userId: string) {
    super(`Profile not found for user: ${userId}`);
    this.name = 'ProfileNotFoundError';
  }
}

export class ProfileValidationError extends ProfileError {
  public errors: string[];

  constructor(message: string, errors: string[] = []) {
    super(message);
    this.name = 'ProfileValidationError';
    this.errors = errors;
  }
}

export class ProfileDuplicateError extends ProfileError {
  public field: 'email' | 'username';

  constructor(field: 'email' | 'username') {
    super(`${field} already exists`);
    this.name = 'ProfileDuplicateError';
    this.field = field;
  }
}