export class PaymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentError';
  }
}

export class PaymentValidationError extends PaymentError {
  public errors: string[];

  constructor(message: string, errors: string[] = []) {
    super(message);
    this.name = 'PaymentValidationError';
    this.errors = errors;
  }
}

export class PaymentNotFoundError extends PaymentError {
  constructor(paymentId: string) {
    super(`Payment not found: ${paymentId}`);
    this.name = 'PaymentNotFoundError';
  }
}

export class PaymentProcessingError extends PaymentError {
  public transactionId?: string;
  
  constructor(message: string, transactionId?: string) {
    super(message);
    this.name = 'PaymentProcessingError';
    this.transactionId = transactionId;
  }
}