import { CreateNotificationParams } from './types';
import { NotificationType } from '../../types/notification';

const VALID_NOTIFICATION_TYPES: NotificationType[] = [
  'success', 'error', 'info', 'warning',
  'bid_received', 'bid_accepted', 'bid_rejected',
  'payment_received', 'shipping_update', 'item_sold',
  'email_verification', 'onboarding_reminder'
];

export const validateNotification = (params: CreateNotificationParams): string[] => {
  const errors: string[] = [];

  if (!params.user_id) {
    errors.push('User ID is required');
  }

  if (!params.message) {
    errors.push('Message is required');
  }

  if (!VALID_NOTIFICATION_TYPES.includes(params.type)) {
    errors.push(`Invalid notification type. Must be one of: ${VALID_NOTIFICATION_TYPES.join(', ')}`);
  }

  if (params.data && typeof params.data !== 'object') {
    errors.push('Data must be an object if provided');
  }

  return errors;
};

export const validateNotificationUpdate = (read: boolean): string[] => {
  const errors: string[] = [];

  if (typeof read !== 'boolean') {
    errors.push('Read status must be a boolean value');
  }

  return errors;
};