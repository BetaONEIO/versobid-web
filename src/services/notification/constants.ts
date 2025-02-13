export const NOTIFICATION_ERRORS = {
  INVALID_TYPE: 'Invalid notification type',
  USER_REQUIRED: 'User ID is required',
  MESSAGE_REQUIRED: 'Message is required',
  NOT_FOUND: 'Notification not found',
  CREATION_FAILED: 'Failed to create notification',
  UPDATE_FAILED: 'Failed to update notification',
  DELETE_FAILED: 'Failed to delete notification',
  INVALID_FILTER: 'Invalid notification filter',
  INVALID_ID: 'Invalid notification ID',
  UNAUTHORIZED: 'Unauthorized notification operation'
} as const;

export const NOTIFICATION_DEFAULTS = {
  READ: false,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  BATCH_SIZE: 100,
  MAX_LIMIT: 100,
  DEFAULT_LIMIT: 20,
  MAX_OFFSET: 1000,
  ALLOWED_SORT_FIELDS: ['created_at', 'type', 'read']
} as const;

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
  BID_RECEIVED: 'bid_received',
  BID_ACCEPTED: 'bid_accepted',
  BID_REJECTED: 'bid_rejected',
  PAYMENT_RECEIVED: 'payment_received',
  SHIPPING_UPDATE: 'shipping_update',
  ITEM_SOLD: 'item_sold',
  EMAIL_VERIFICATION: 'email_verification',
  ONBOARDING_REMINDER: 'onboarding_reminder'
} as const;

export type NotificationErrorCode = keyof typeof NOTIFICATION_ERRORS;
export type NotificationTypeKey = keyof typeof NOTIFICATION_TYPES;
export type NotificationDefaultKey = keyof typeof NOTIFICATION_DEFAULTS;