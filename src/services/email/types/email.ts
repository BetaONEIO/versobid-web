import { Database } from '../../../types/supabase';

export type EmailLogRow = Database['public']['Tables']['email_logs']['Row'];
export type EmailLogInsert = Database['public']['Tables']['email_logs']['Insert'];
export type EmailLogUpdate = Database['public']['Tables']['email_logs']['Update'];

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