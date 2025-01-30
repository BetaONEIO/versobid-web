export interface PaymentValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface PaymentValidationOptions {
  validateAmount?: boolean;
  validateCurrency?: boolean;
  validateProvider?: boolean;
  validateTransactionId?: boolean;
}

export interface PaymentValidationError {
  field: string;
  message: string;
  code: string;
}