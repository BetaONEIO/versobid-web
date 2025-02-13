export * from './template';
export * from './templateParams';
export * from './emailLog';

export interface EmailOptions {
  to: string;
  subject: string;
  templateName: string;
  params: Record<string, any>;
}

export interface EmailService {
  sendEmail: (options: EmailOptions) => Promise<void>;
  sendWelcomeEmail: (email: string, name: string) => Promise<void>;
  sendPasswordResetEmail: (email: string, resetToken: string) => Promise<void>;
  sendBidNotificationEmail: (
    email: string,
    itemTitle: string,
    bidAmount: number,
    itemId: string
  ) => Promise<void>;
  sendBidAcceptedEmail: (
    email: string,
    itemTitle: string,
    bidAmount: number,
    sellerName: string,
    paymentLink: string
  ) => Promise<void>;
}

export interface EmailError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface EmailValidationResult {
  isValid: boolean;
  errors: string[];
}