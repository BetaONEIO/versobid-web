import { EmailTemplate } from '../types';
import { formatCurrency, formatDate } from '../../../utils/email/emailUtils';

interface PaymentConfirmationParams {
  itemTitle: string;
  amount: number;
  transactionId: string;
  paymentDate: Date;
}

export const paymentConfirmationTemplate: EmailTemplate<PaymentConfirmationParams> = {
  name: 'payment-confirmation',
  subject: 'Payment Confirmation - VersoBid',
  getParams: (data?: PaymentConfirmationParams) => ({
    item_title: data?.itemTitle ?? '',
    amount: data?.amount ? formatCurrency(data.amount) : '$0.00',
    transaction_id: data?.transactionId ?? '',
    payment_date: data?.paymentDate ? formatDate(data.paymentDate) : ''
  })
};