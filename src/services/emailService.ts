interface EmailOptions {
  to: string;
  subject: string;
  templateName: string;
  params: Record<string, any>;
}

export const emailService = {
  async sendEmail({ to, subject, templateName, params }: EmailOptions): Promise<void> {
    // In a real application, this would make an API call to your backend
    console.log('Sending email:', {
      to,
      subject,
      templateName,
      params
    });
  },

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Welcome to VersoBid!',
      templateName: 'welcome',
      params: {
        name,
        confirmation_link: `${window.location.origin}/confirm-email`
      }
    });
  },

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Reset Your VersoBid Password',
      templateName: 'password-reset',
      params: {
        reset_link: `${window.location.origin}/reset-password?token=${resetToken}`
      }
    });
  },

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
        bid_amount: bidAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
        item_link: `${window.location.origin}/items/${itemId}`
      }
    });
  },

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
        bid_amount: bidAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
        seller_name: sellerName,
        payment_link: paymentLink
      }
    });
  }
};