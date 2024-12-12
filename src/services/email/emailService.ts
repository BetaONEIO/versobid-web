import { EmailOptions } from './types';
import {
  welcomeTemplate,
  passwordResetTemplate,
  newBidTemplate,
  bidAcceptedTemplate
} from './templates';

class EmailService {
  private async sendEmail(options: EmailOptions): Promise<void> {
    // In a real application, this would make an API call to your backend
    console.log('Sending email:', options);
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: welcomeTemplate.subject,
      templateName: welcomeTemplate.name,
      params: welcomeTemplate.getParams({ name })
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: passwordResetTemplate.subject,
      templateName: passwordResetTemplate.name,
      params: passwordResetTemplate.getParams({ resetToken })
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
      subject: newBidTemplate.subject,
      templateName: newBidTemplate.name,
      params: newBidTemplate.getParams({ itemTitle, bidAmount, itemId })
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
      subject: bidAcceptedTemplate.subject,
      templateName: bidAcceptedTemplate.name,
      params: bidAcceptedTemplate.getParams({
        itemTitle,
        bidAmount,
        sellerName,
        paymentLink
      })
    });
  }
}

export const emailService = new EmailService();