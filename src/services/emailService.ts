import * as SibApiV3Sdk from 'sib-api-v3-typescript';

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, import.meta.env.VITE_BREVO_API_KEY);

// Store template IDs as constants
const TEMPLATE_IDS = {
  WELCOME: 2, // Welcome email template ID
  PASSWORD_RESET: 3, // Password reset template ID
  NEW_BID: 4, // New bid template ID
  BID_ACCEPTED: 5, // Bid accepted template ID
};

export const emailService = {
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    
    sendSmtpEmail.to = [{ email, name }];
    sendSmtpEmail.templateId = TEMPLATE_IDS.WELCOME;
    sendSmtpEmail.params = {
      name: name,
      confirmation_link: `${window.location.origin}/confirm-email`,
      current_year: new Date().getFullYear()
    };

    try {
      await apiInstance.sendTransacEmail(sendSmtpEmail);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw new Error('Failed to send welcome email');
    }
  },

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    
    sendSmtpEmail.to = [{ email }];
    sendSmtpEmail.templateId = TEMPLATE_IDS.PASSWORD_RESET;
    sendSmtpEmail.params = {
      reset_link: `${window.location.origin}/reset-password?token=${resetToken}`,
      current_year: new Date().getFullYear()
    };

    try {
      await apiInstance.sendTransacEmail(sendSmtpEmail);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  },

  async sendBidNotificationEmail(email: string, itemTitle: string, bidAmount: number, itemId: string): Promise<void> {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    
    sendSmtpEmail.to = [{ email }];
    sendSmtpEmail.templateId = TEMPLATE_IDS.NEW_BID;
    sendSmtpEmail.params = {
      item_title: itemTitle,
      bid_amount: bidAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      item_link: `${window.location.origin}/items/${itemId}`,
      current_year: new Date().getFullYear()
    };

    try {
      await apiInstance.sendTransacEmail(sendSmtpEmail);
    } catch (error) {
      console.error('Error sending bid notification email:', error);
      throw new Error('Failed to send bid notification email');
    }
  },

  async sendBidAcceptedEmail(email: string, itemTitle: string, bidAmount: number, sellerName: string, paymentLink: string): Promise<void> {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    
    sendSmtpEmail.to = [{ email }];
    sendSmtpEmail.templateId = TEMPLATE_IDS.BID_ACCEPTED;
    sendSmtpEmail.params = {
      item_title: itemTitle,
      bid_amount: bidAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      seller_name: sellerName,
      payment_link: paymentLink,
      current_year: new Date().getFullYear()
    };

    try {
      await apiInstance.sendTransacEmail(sendSmtpEmail);
    } catch (error) {
      console.error('Error sending bid accepted email:', error);
      throw new Error('Failed to send bid accepted email');
    }
  }
};