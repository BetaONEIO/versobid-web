import { EmailTemplate } from '../types';
import { getAppUrl } from '../../../utils/email/emailUtils';

export const welcomeTemplate: EmailTemplate = {
  name: 'welcome',
  subject: 'Welcome to VersoBid!',
  getParams: (data: { name: string }) => ({
    name: data.name,
    confirmation_link: `${getAppUrl()}/confirm-email`
  })
};