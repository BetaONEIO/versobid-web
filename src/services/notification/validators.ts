import { CreateNotificationParams } from './types';

const VALID_NOTIFICATION_TYPES = [
  'success', 'error', 'info', 'warning',
  'bid_received', 'bid_accepted', 'bid_rejected',
  'payment_received', 'shipping_update', 'item_sold',
  'email_verification', 'onboarding_reminder'
] as const;

export const validateNotification = (params: CreateNotificationParams): string[] => {
  const errors: string[] = [];

  if (!params.user_id) {
    errors.push('User ID is required');
  }

  if (!params.message) {
    errors.push('Message is required');
  }

  if (!VALID_NOTIFICATION_TYPES.includes(params.type as any)) {
    errors.push(`Invalid notification type. Must be one of: ${VALID_NOTIFICATION_TYPES.join(', ')}`);
  }

  if (params.data && typeof params.data !== 'object') {
    errors.push('Data must be an object if provided');
  }

  return errors;
};