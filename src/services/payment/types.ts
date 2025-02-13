import { Database } from '../../types/supabase';

export type PaymentRow = Database['public']['Tables']['payments']['Row'];
export type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
export type PaymentUpdate = Database['public']['Tables']['payments']['Update'];

export interface PaymentService {
  createPayPalOrder: (paymentDetails: PaymentDetails) => Promise<{ id: string }>;
  recordPayment: (details: PaymentDetails) => Promise<void>;
  confirmShipping: (paymentId: string) => Promise<void>;
}

export interface PaymentDetails {
  amount: number;
  currency: string;
  itemId: string;
  buyerId: string;
  sellerId: string;
  transactionId: string;
}

export interface PaymentError {
  code: string;
  message: string;
  details?: Record<string, any>;
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

export interface PaymentProvider {
  name: string;
  isEnabled: boolean;
  config: PaymentConfig;
}

export interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: string;
  metadata?: Record<string, any>;
}

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'cancelled';