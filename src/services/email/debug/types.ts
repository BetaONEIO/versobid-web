export interface DiagnosticResult {
  success: boolean;
  message: string;
  error?: Error;
}

export interface EmailSystemConfig {
  brevoApiKey: string;
  testEmail: string;
}

export interface EmailLogResult {
  id: string;
  recipient: string;
  subject: string;
  status: 'pending' | 'sent' | 'failed';
  error?: string;
  created_at: string;
}