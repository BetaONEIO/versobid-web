import { emailService } from '../../services/email/emailService';

export const testEmailService = async (email: string): Promise<boolean> => {
  try {
    await emailService.sendEmail({
      to: email,
      subject: 'VersoBid Email Test',
      templateName: 'test',
      params: {
        name: 'Test User',
        timestamp: new Date().toISOString()
      }
    });
    
    console.log('Test email sent successfully to:', email);
    return true;
  } catch (error) {
    console.error('Failed to send test email:', error);
    return false;
  }
};