import { PaymentDetails } from './types';
import { PAYMENT_DEFAULTS } from './constants';

export const validatePaymentDetails = (details: PaymentDetails): string[] => {
  const errors: string[] = [];

  if (!details.amount || details.amount <= PAYMENT_DEFAULTS.MIN_AMOUNT) {
    errors.push(`Amount must be greater than ${PAYMENT_DEFAULTS.MIN_AMOUNT}`);
  }

  if (details.amount > PAYMENT_DEFAULTS.MAX_AMOUNT) {
    errors.push(`Amount cannot exceed ${PAYMENT_DEFAULTS.MAX_AMOUNT}`);
  }

  if (!details.currency || !validateCurrency(details.currency)) {
    errors.push('Invalid currency');
  }

  if (!details.itemId) {
    errors.push('Item ID is required');
  }

  if (!details.buyerId) {
    errors.push('Buyer ID is required');
  }

  if (!details.sellerId) {
    errors.push('Seller ID is required');
  }

  if (!details.transactionId) {
    errors.push('Transaction ID is required');
  }

  return errors;
};

export const validateCurrency = (currency: string): boolean => {
  const validCurrencies = ['GBP', 'USD', 'EUR'];
  return validCurrencies.includes(currency.toUpperCase());
};

export const validateAmount = (amount: number): boolean => {
  return (
    amount >= PAYMENT_DEFAULTS.MIN_AMOUNT && 
    amount <= PAYMENT_DEFAULTS.MAX_AMOUNT && 
    Number.isFinite(amount)
  );
};

export const validatePaymentProvider = (provider: string): boolean => {
  return ['paypal', 'stripe'].includes(provider.toLowerCase());
};

export const validateTransactionId = (transactionId: string): boolean => {
  return /^[a-zA-Z0-9_-]+$/.test(transactionId);
};