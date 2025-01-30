export const PAYMENT_ERRORS = {
  INVALID_AMOUNT: 'Invalid payment amount',
  INVALID_CURRENCY: 'Invalid currency',
  TRANSACTION_FAILED: 'Payment transaction failed',
  PAYMENT_NOT_FOUND: 'Payment not found',
  UNAUTHORIZED: 'Unauthorized payment operation',
  INVALID_STATUS: 'Invalid payment status',
  SHIPPING_DEADLINE_PASSED: 'Shipping deadline has passed',
  ALREADY_CONFIRMED: 'Payment already confirmed'
} as const;

export const PAYMENT_DEFAULTS = {
  CURRENCY: 'GBP',
  SHIPPING_DEADLINE_DAYS: 7,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  MIN_AMOUNT: 0.01,
  MAX_AMOUNT: 1000000
} as const;

export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled'
} as const;

export type PaymentErrorCode = keyof typeof PAYMENT_ERRORS;
export type PaymentStatus = typeof PAYMENT_STATUSES[keyof typeof PAYMENT_STATUSES];