import { BaseError } from './BaseError';
import { ERROR_MESSAGES } from '../constants/errorMessages';

export class ProfileNotFoundError extends BaseError {
  constructor(userId: string) {
    super(ERROR_MESSAGES.PROFILE_NOT_FOUND(userId), 'ProfileNotFoundError');
  }
}