import { PaymentDetails } from '../../../services/payment/types/payment';

export interface PayPalButtonProps {
  paymentDetails: PaymentDetails;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
} 