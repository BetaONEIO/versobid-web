import { emailTemplates } from './templates/templateStrings';

export class TemplateManager {
  private templateCache: Map<string, string> = new Map();

  loadTemplate(templateName: string): string {
    // Check cache first
    const cached = this.templateCache.get(templateName);
    if (cached) return cached;

    // Get template from templateStrings
    const template = emailTemplates[templateName as keyof typeof emailTemplates];
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }
    
    // Cache the template
    this.templateCache.set(templateName, template);
    
    return template;
  }

  compileTemplate(template: string, params: Record<string, any>): string {
    // Add current year to all templates
    const allParams = {
      ...params,
      current_year: new Date().getFullYear()
    };

    // Replace all parameters in template
    return template.replace(
      /\{\{\s*params\.([^}]+)\s*\}\}/g,
      (_, key: string) => String(allParams[key as keyof typeof allParams] ?? '')
    );
  }
}

export const templateManager = new TemplateManager();