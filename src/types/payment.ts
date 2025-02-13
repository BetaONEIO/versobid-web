export interface PaymentDetails {
  amount: number;
  currency: string;
  itemId: string;
  buyerId: string;
  sellerId: string;
  transactionId: string;
}

export interface PaymentStatus {
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  error?: string;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  transactionId?: string;
}

export interface PaymentValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface PaymentConfig {
  currency: string;
  locale: string;
  intent: 'capture' | 'authorize';
  enableFunding: string[];
  disableFunding: string[];
}