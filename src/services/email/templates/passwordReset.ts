import { EmailTemplate } from '../types';
import { getAppUrl } from '../../../utils/email/emailUtils';

interface PasswordResetParams {
  resetToken: string;
}

export const passwordResetTemplate: EmailTemplate<PasswordResetParams> = {
  name: 'password-reset',
  subject: 'Reset Your VersoBid Password',
  getParams: (data?: PasswordResetParams) => ({
    reset_link: data?.resetToken ? `${getAppUrl()}/reset-password?token=${data.resetToken}` : ''
  })
};