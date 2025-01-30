import { PaymentStatus } from './payment';

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