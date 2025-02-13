import { emailService } from './emailService';

export const sendTestEmail = async (to: string): Promise<void> => {
  try {
    await emailService.sendEmail({
      to,
      subject: 'VersoBid Test Email',
      templateName: 'test',
      params: {
        name: 'Test User',
        timestamp: new Date().toISOString()
      }
    });
    console.log('Test email sent successfully');
  } catch (error) {
    console.error('Failed to send test email:', error);
    throw error;
  }
};