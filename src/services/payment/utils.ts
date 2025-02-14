import { PaymentRow, PaymentTransaction, PaymentStatus } from './types/payment';
import { PAYMENT_DEFAULTS, PAYMENT_STATUSES } from './constants';

export const calculateShippingDeadline = (days = PAYMENT_DEFAULTS.SHIPPING_DEADLINE_DAYS): string => {
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + days);
  return deadline.toISOString();
};

export const formatPaymentAmount = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const transformPaymentRow = (row: PaymentRow): PaymentTransaction => ({
  id: row.id,
  amount: row.amount,
  currency: row.currency,
  status: row.status as PaymentStatus,
  provider: row.provider,
  metadata: {
    item_id: row.item_id,
    buyer_id: row.buyer_id,
    seller_id: row.seller_id,
    transaction_id: row.transaction_id,
    shipping_deadline: row.shipping_deadline,
    shipping_confirmed: row.shipping_confirmed,
    created_at: row.created_at
  }
});

export const isValidPaymentProvider = (provider: string): boolean => {
  return ['paypal', 'stripe'].includes(provider.toLowerCase());
};

export const isShippingDeadlinePassed = (deadline: string): boolean => {
  return new Date(deadline) < new Date();
};

export const getPaymentStatus = (status: string): keyof typeof PAYMENT_STATUSES => {
  const validStatus = Object.keys(PAYMENT_STATUSES).find(
    key => PAYMENT_STATUSES[key as keyof typeof PAYMENT_STATUSES] === status
  );
  
  if (!validStatus) {
    throw new Error(`Invalid payment status: ${status}`);
  }

  return validStatus as keyof typeof PAYMENT_STATUSES;
};

export const formatTransactionId = (id: string): string => {
  return id.replace(/[^a-zA-Z0-9_-]/g, '');
};