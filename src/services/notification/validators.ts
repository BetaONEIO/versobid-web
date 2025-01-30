import { CreateNotificationParams } from './types';
import { NotificationType } from '../../types/notification';

export const validateNotification = (params: CreateNotificationParams): string[] => {
  const errors: string[] = [];

  if (!params.user_id) {
    errors.push('User ID is required');
  }

  if (!params.message) {
    errors.push('Message is required');
  }

  const validTypes = Object.values(NotificationType);
  if (!validTypes.includes(params.type)) {
    errors.push(`Invalid notification type. Must be one of: ${validTypes.join(', ')}`);
  }

  if (params.data && typeof params.data !== 'object') {
    errors.push('Data must be an object if provided');
  }

  return errors;
};