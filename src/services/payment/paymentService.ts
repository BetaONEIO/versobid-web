import { supabase } from '../../lib/supabase';
import {
  PaymentDetails,
  PaymentService,
  PaymentInsert,
  PaymentTransaction,
} from './types/payment';
import { validatePaymentDetails } from './validators';
import { transformPaymentRow } from './utils';
import { PaymentError, PaymentValidationError } from './errors';
import { PAYMENT_ERRORS } from './constants';
import { Database } from '../../types/supabase';

type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
type ItemUpdate = Database['public']['Tables']['items']['Update'];

class PaymentServiceImpl implements PaymentService {
  async createPayPalOrder(
    paymentDetails: PaymentDetails
  ): Promise<{ id: string }> {
    try {
      const errors = validatePaymentDetails(paymentDetails);
      if (errors.length > 0) {
        throw new PaymentValidationError('Invalid payment details', errors);
      }

      // Simulated PayPal API call
      console.log('Creating PayPal order:', paymentDetails);
      return { id: 'mock-order-id' };
    } catch (error) {
      throw new PaymentError(
        error instanceof Error
          ? error.message
          : PAYMENT_ERRORS.TRANSACTION_FAILED
      );
    }
  }

  async recordPayment(details: PaymentDetails): Promise<void> {
    const errors = validatePaymentDetails(details);
    if (errors.length > 0) {
      throw new PaymentValidationError('Invalid payment details', errors);
    }

    // Check if payment with this transaction ID already exists
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('transaction_id', details.transactionId)
      .single();

    if (existingPayment) {
      console.log('Payment already recorded for transaction:', details.transactionId);
      return; // Payment already exists, skip recording
    }

    const paymentData: PaymentInsert = {
      amount: details.amount,
      currency: details.currency,
      item_id: details.itemId,
      buyer_id: details.buyerId,
      seller_id: details.sellerId,
      transaction_id: details.transactionId,
      status: 'completed',
      provider: 'paypal'
    };

    const { error: paymentError } = await supabase
      .from('payments')
      .insert(paymentData);

    if (paymentError) throw new PaymentError(paymentError.message);

    const itemUpdate: ItemUpdate = { status: 'completed' };
    const { error: itemError } = await supabase
      .from('items')
      .update(itemUpdate)
      .eq('id', details.itemId);

    if (itemError) throw new PaymentError(itemError.message);

    const notification: NotificationInsert = {
      user_id: details.sellerId,
      type: 'payment_received',
      message: 'Payment received for item',
      data: {
        amount: details.amount,
        currency: details.currency,
        transaction_id: details.transactionId
      }
    };

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert(notification);//removed array [] --add it if necessary later

    if (notificationError) throw new PaymentError(notificationError.message);
  }

  async getPaymentById(paymentId: string): Promise<PaymentTransaction> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (error) throw new PaymentError(error.message);
    if (!data) throw new PaymentError(PAYMENT_ERRORS.PAYMENT_NOT_FOUND);

    return transformPaymentRow(data);
  }

  async getPaymentsByUser(userId: string): Promise<PaymentTransaction[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw new PaymentError(error.message);
    return (data || []).map(row => transformPaymentRow(row));
  }

  async confirmShipping(paymentId: string): Promise<void> {
    const { data, error } = await supabase
      .from('payments')
      .select('shipping_confirmed')
      .eq('id', paymentId)
      .single();

    if (error) throw new PaymentError(error.message);
    if (!data) throw new PaymentError(PAYMENT_ERRORS.PAYMENT_NOT_FOUND);

    const { error: updateError } = await supabase
      .from('payments')
      .update({ shipping_confirmed: true })
      .eq('id', paymentId);

    if (updateError) throw new PaymentError(updateError.message);
  }
}

export const paymentService = new PaymentServiceImpl();