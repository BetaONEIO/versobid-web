export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class UserExistsError extends AuthError {
  constructor(field: string) {
    super(`${field} already exists`);
    this.name = 'UserExistsError';
  }
}

export class ValidationError extends AuthError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}