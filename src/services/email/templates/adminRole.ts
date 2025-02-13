import { EmailTemplate } from '../types';
import { getAppUrl } from '../../../utils/email/emailUtils';

export const adminRoleTemplate: EmailTemplate = {
  name: 'admin-role',
  subject: 'Admin Access Granted - VersoBid',
  getParams: () => ({
    admin_dashboard_link: `${getAppUrl()}/admin`
  })
};