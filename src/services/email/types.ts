export interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  template_name: string;
  status: 'pending' | 'sent' | 'failed';
  error?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateEmailLogParams {
  recipient: string;
  subject: string;
  template_name: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  templateName: string;
  params: Record<string, any>;
}

export interface EmailTemplate<T = any> {
  name: string;
  subject: string;
  getParams: (data?: T) => Record<string, any>;
}