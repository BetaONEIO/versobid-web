export interface NotificationValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface NotificationValidationOptions {
  validateType?: boolean;
  validateMessage?: boolean;
  validateData?: boolean;
  validateUserId?: boolean;
}

export interface NotificationValidationError {
  field: string;
  message: string;
  code: string;
}

export interface NotificationValidationRule {
  field: string;
  validate: (value: any) => boolean;
  message: string;
}