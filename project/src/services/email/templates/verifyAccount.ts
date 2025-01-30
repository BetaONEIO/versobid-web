import { EmailTemplate } from '../types';
import { getAppUrl } from '../../../utils/email/emailUtils';

interface VerifyAccountParams {
  token: string;
}

export const verifyAccountTemplate: EmailTemplate<VerifyAccountParams> = {
  name: 'verify-account',
  subject: 'Verify Your VersoBid Account',
  getParams: (data?: VerifyAccountParams) => ({
    verification_link: data?.token ? `${getAppUrl()}/verify-email?token=${data.token}` : ''
  })
};