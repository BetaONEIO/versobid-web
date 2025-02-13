import { EmailTemplate } from '../types';

interface TestEmailParams {
  name: string;
  timestamp: string;
}

export const testTemplate: EmailTemplate<TestEmailParams> = {
  name: 'test',
  subject: 'VersoBid Test Email',
  getParams: (data) => ({
    name: data?.name || 'User',
    timestamp: data?.timestamp || new Date().toISOString()
  })
};