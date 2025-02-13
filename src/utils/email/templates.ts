export const EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  PASSWORD_RESET: 'password-reset',
  NEW_BID: 'new-bid',
  BID_ACCEPTED: 'bid-accepted'
} as const;

export type EmailTemplate = typeof EMAIL_TEMPLATES[keyof typeof EMAIL_TEMPLATES];

export interface EmailTemplateParams {
  name?: string;
  confirmation_link?: string;
  reset_link?: string;
  item_title?: string;
  bid_amount?: string;
  seller_name?: string;
  payment_link?: string;
  item_link?: string;
  current_year: number;
}