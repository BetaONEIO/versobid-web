import { templateManager } from './templateManager';
import { EmailTemplate } from './types';

export class EmailRenderer {
  render(template: EmailTemplate, data?: Record<string, any>): string {
    const htmlTemplate = templateManager.loadTemplate(template.name);
    return templateManager.compileTemplate(htmlTemplate, template.getParams(data));
  }
}

export const emailRenderer = new EmailRenderer();