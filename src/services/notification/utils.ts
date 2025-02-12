import { Notification, NotificationType } from '../../types/notification';
import { NOTIFICATION_DEFAULTS } from './constants';
import { Database } from '../../types/supabase';

type NotificationRow = Database['public']['Tables']['notifications']['Row'];

export const transformNotification = (row: NotificationRow): Notification => {
  if (!isValidNotificationType(row.type)) {
    throw new Error(`Invalid notification type: ${row.type}`);
  }

  return {
    id: row.id,
    type: row.type as NotificationType,
    message: row.message,
    read: row.read,
    user_id: row.user_id,
    created_at: row.created_at,
    data: row.data
  };
};

export const isValidNotificationType = (type: string): type is NotificationType => {
  const validTypes: NotificationType[] = [
    'success', 'error', 'info', 'warning',
    'bid_received', 'bid_accepted', 'bid_rejected',
    'payment_received', 'shipping_update', 'item_sold',
    'email_verification', 'onboarding_reminder'
  ];
  return validTypes.includes(type as NotificationType);
};

export const formatNotificationError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

export const isValidNotificationData = (data: unknown): data is Record<string, unknown> => {
  return typeof data === 'object' && data !== null && !Array.isArray(data);
};

export const getBatchSize = (size?: number): number => {
  return size || NOTIFICATION_DEFAULTS.BATCH_SIZE;
};

export const validateNotificationId = (id: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
};