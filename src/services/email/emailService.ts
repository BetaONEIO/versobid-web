import { Resend } from 'resend';
import { emailRenderer } from './emailRenderer';
import { EmailOptions, EmailService } from './types/email';
import { emailLogger } from './emailLogger';
import { EmailError, EmailValidationError } from './errors';
import { EMAIL_ERRORS, EMAIL_DEFAULTS } from './constants';
import { formatCurrency } from '../../utils/formatters';
import { getAppUrl } from '../../utils/email/emailUtils';

class EmailServiceImpl implements EmailService {
  private readonly resend: Resend;
  private readonly defaultConfig = {
    from: EMAIL_DEFAULTS.FROM_ADDRESS,
    replyTo: EMAIL_DEFAULTS.FROM_ADDRESS,
    language: EMAIL_DEFAULTS.LANGUAGE,
    encoding: EMAIL_DEFAULTS.ENCODING
  };

  constructor() {
    const apiKey = import.meta.env.VITE_RESEND_API_KEY;
    if (!apiKey) {
      console.warn('Resend API key not configured');
    }
    this.resend = new Resend(apiKey);
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    let logId: string | undefined;

    try {
      if (!this.resend) {
        throw new EmailError(EMAIL_ERRORS.INVALID_CONFIG);
      }

      const errors = validateEmailRequest(options);
      if (errors.length > 0) {
        throw new EmailValidationError('Invalid email request', errors);
      }

      // Create log entry
      const log = await emailLogger.createLog({
        recipient: options.to,
        subject: options.subject,
        template_name: options.templateName
      });
      logId = log.id;

      // Render email content
      const htmlContent = emailRenderer.render(
        {
          name: options.templateName,
          subject: options.subject,
          getParams: () => options.params
        },
        options.params
      );

      // Send email using Resend
      const result = await this.resend.emails.send({
        from: this.defaultConfig.from,
        to: options.to,
        subject: options.subject,
        html: htmlContent
      });

      if (!result || result.error) {
        throw new Error(result?.error?.message || EMAIL_ERRORS.SEND_FAILED);
      }

      // Update log status
      await emailLogger.updateStatus(log.id, 'sent');
    } catch (error) {
      console.error('Failed to send email:', error);
      
      if (logId) {
        await emailLogger.updateStatus(
          logId, 
          'failed', 
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
      
      throw error instanceof EmailError ? error : new EmailError(EMAIL_ERRORS.SEND_FAILED);
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Welcome to VersoBid!',
      templateName: 'welcome',
      params: {
        name,
        confirmation_link: `${getAppUrl()}/confirm-email`
      }
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Reset Your VersoBid Password',
      templateName: 'password-reset',
      params: {
        reset_link: `${getAppUrl()}/reset-password?token=${resetToken}`
      }
    });
  }

  async sendBidNotificationEmail(
    email: string,
    itemTitle: string,
    bidAmount: number,
    itemId: string
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'New Bid Received',
      templateName: 'new-bid',
      params: {
        item_title: itemTitle,
        bid_amount: formatCurrency(bidAmount),
        item_link: `${getAppUrl()}/items/${itemId}`
      }
    });
  }

  async sendBidAcceptedEmail(
    email: string,
    itemTitle: string,
    bidAmount: number,
    sellerName: string,
    paymentLink: string
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Your Bid Was Accepted!',
      templateName: 'bid-accepted',
      params: {
        item_title: itemTitle,
        bid_amount: formatCurrency(bidAmount),
        seller_name: sellerName,
        payment_link: paymentLink
      }
    });
  }
}

export const emailService = new EmailServiceImpl();

function validateEmailRequest(options: EmailOptions): string[] {
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
}