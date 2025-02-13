// Define specific parameter types for each template
export interface WelcomeEmailParams {
  name: string;
  confirmation_link: string;
}

export interface PasswordResetParams {
  reset_link: string;
}

export interface BidNotificationParams {
  item_title: string;
  bid_amount: number;
  item_link: string;
}

export interface BidAcceptedParams {
  item_title: string;
  bid_amount: number;
  seller_name: string;
  payment_link: string;
}

export interface PaymentConfirmationParams {
  item_title: string;
  amount: number;
  transaction_id: string;
  payment_date: Date;
}

export interface ShippingUpdateParams {
  item_title: string;
  shipping_status: string;
  tracking_number?: string;
  carrier?: string;
  tracking_url?: string;
}

export interface EmailTemplateParams {
  welcome: WelcomeEmailParams;
  password_reset: PasswordResetParams;
  bid_notification: BidNotificationParams;
  bid_accepted: BidAcceptedParams;
  payment_confirmation: PaymentConfirmationParams;
  shipping_update: ShippingUpdateParams;
}

// Template names as a type
export type TemplateName = keyof EmailTemplateParams;