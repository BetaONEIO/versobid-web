import { BaseError } from './BaseError';
import { ERROR_MESSAGES } from '../constants/errorMessages';

export class ProfileValidationError extends BaseError {
  constructor(errors: string[]) {
    super(ERROR_MESSAGES.VALIDATION_FAILED(errors), 'ProfileValidationError');
  }
}