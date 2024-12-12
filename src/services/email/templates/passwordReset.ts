import { EmailTemplate } from '../types';
import { getAppUrl } from '../../../utils/email/emailUtils';

export const passwordResetTemplate: EmailTemplate = {
  name: 'password-reset',
  subject: 'Reset Your VersoBid Password',
  getParams: (data: { resetToken: string }) => ({
    reset_link: `${getAppUrl()}/reset-password?token=${data.resetToken}`
  })
};