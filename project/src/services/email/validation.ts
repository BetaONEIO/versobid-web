import { EmailOptions } from './types/email';
import { EMAIL_ERRORS } from './constants';

export const validateEmailRequest = (options: EmailOptions): string[] => {
  const errors: string[] = [];

  if (!options.to || !options.to.includes('@')) {
    errors.push(EMAIL_ERRORS.INVALID_RECIPIENT);
  }

  if (!options.subject) {
    errors.push('Email subject is required');
  }

  if (!options.templateName) {
    errors.push(EMAIL_ERRORS.INVALID_TEMPLATE);
  }

  if (!options.params || typeof options.params !== 'object') {
    errors.push(EMAIL_ERRORS.MISSING_PARAMS);
  }

  return errors;
};

export const validateEmailAddress = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateTemplateName = (templateName: string): boolean => {
  const validTemplates = [
    'welcome',
    'password-reset',
    'new-bid',
    'bid-accepted',
    'payment-confirmation',
    'shipping-update'
  ];
  return validTemplates.includes(templateName);
};

export const validateTemplateParams = (
  templateName: string,
  params: Record<string, any>
): string[] => {
  const errors: string[] = [];
  const requiredParams: Record<string, string[]> = {
    welcome: ['name', 'confirmation_link'],
    'password-reset': ['reset_link'],
    'new-bid': ['item_title', 'bid_amount', 'item_link'],
    'bid-accepted': ['item_title', 'bid_amount', 'seller_name', 'payment_link'],
    'payment-confirmation': ['item_title', 'amount', 'transaction_id'],
    'shipping-update': ['item_title', 'shipping_status']
  };

  const required = requiredParams[templateName];
  if (!required) {
    errors.push(`Unknown template: ${templateName}`);
    return errors;
  }

  for (const param of required) {
    if (!params[param]) {
      errors.push(`Missing required parameter: ${param}`);
    }
  }

  return errors;
};