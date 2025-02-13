export class EmailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmailError';
  }
}

export class EmailValidationError extends EmailError {
  public errors: string[];

  constructor(message: string, errors: string[] = []) {
    super(message);
    this.name = 'EmailValidationError';
    this.errors = errors;
  }
}

export class EmailTemplateError extends EmailError {
  constructor(templateName: string, message: string) {
    super(`Template error (${templateName}): ${message}`);
    this.name = 'EmailTemplateError';
  }
}

export class EmailSendError extends EmailError {
  public recipient: string;
  public templateName: string;

  constructor(recipient: string, templateName: string, message: string) {
    super(`Failed to send email to ${recipient} using template ${templateName}: ${message}`);
    this.name = 'EmailSendError';
    this.recipient = recipient;
    this.templateName = templateName;
  }
}