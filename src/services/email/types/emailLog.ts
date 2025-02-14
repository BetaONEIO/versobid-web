export interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  template_name: string;
  status: 'pending' | 'sent' | 'failed';
  error?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface CreateEmailLogParams {
  recipient: string;
  subject: string;
  template_name: string;
}

export interface EmailLogUpdate {
  status?: 'pending' | 'sent' | 'failed';
  error?: string | null;
  updated_at?: string;
}

export interface EmailLogFilter {
  recipient?: string;
  status?: 'pending' | 'sent' | 'failed';
  startDate?: string;
  endDate?: string;
}