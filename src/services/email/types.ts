export interface EmailOptions {
  to: string;
  subject: string;
  templateName: string;
  params: Record<string, any>;
}

export interface EmailTemplate {
  name: string;
  subject: string;
  getParams: (data: Record<string, any>) => Record<string, any>;
}