import { TemplateName, EmailTemplateParams } from './templateParams';

export interface EmailTemplate<T extends TemplateName> {
  name: T;
  subject: string;
  getParams: (data: EmailTemplateParams[T]) => Record<string, string>;
}

export interface EmailTemplateBase {
  name: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailTemplateConfig {
  defaultFrom: string;
  defaultReplyTo?: string;
  defaultLanguage: string;
  defaultEncoding: string;
}

export interface EmailTemplateRenderOptions {
  inline?: boolean;
  minify?: boolean;
  removeComments?: boolean;
}