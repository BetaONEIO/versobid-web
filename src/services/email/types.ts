export interface EmailOptions {
  to: string;
  subject: string;
  templateName: string;
  params: Record<string, any>;
}

export interface EmailTemplate {
  name: string;
  subject: string;
  getParams: (data: any) => Record<string, any>;
}