import { Database } from '../../../types/supabase';

export type PaymentRow = Database['public']['Tables']['payments']['Row'];
export type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
export type PaymentUpdate = Database['public']['Tables']['payments']['Update'];

export interface PaymentDetails {
  amount: number;
  currency: string;
  itemId: string;
  buyerId: string;
  sellerId: string;
  transactionId: string;
}

export interface PaymentService {
  createPayPalOrder: (paymentDetails: PaymentDetails) => Promise<{ id: string }>;
  recordPayment: (details: PaymentDetails) => Promise<void>;
  confirmShipping: (paymentId: string) => Promise<void>;
  getPaymentById: (paymentId: string) => Promise<PaymentTransaction>;
  getPaymentsByUser: (userId: string) => Promise<PaymentTransaction[]>;
}

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'cancelled';

export interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: string;
  metadata?: PaymentTransactionMetadata;
}

export interface PaymentTransactionMetadata {
  item_id: string;
  buyer_id: string;
  seller_id: string;
  transaction_id: string;
  shipping_deadline?: string | null;
  shipping_confirmed?: boolean;
  created_at: string;
}