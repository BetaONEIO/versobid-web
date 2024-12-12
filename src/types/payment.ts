export interface PaymentDetails {
  amount: number;
  currency: string;
  itemTitle: string;
  orderId?: string;
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