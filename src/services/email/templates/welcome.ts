import { EmailTemplate } from '../types';
import { getAppUrl } from '../../../utils/email/emailUtils';

interface WelcomeParams {
  name: string;
}

export const welcomeTemplate: EmailTemplate<WelcomeParams> = {
  name: 'welcome',
  subject: 'Welcome to VersoBid!',
  getParams: (data?: WelcomeParams) => ({
    name: data?.name ?? '',
    confirmation_link: `${getAppUrl()}/confirm-email`
  })
};