import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
type ItemUpdate = Database['public']['Tables']['items']['Update'];

export interface PaymentDetails {
  amount: number;
  currency: string;
  itemId: string;
  buyerId: string;
  sellerId: string;
  transactionId: string;
}

export const paymentService = {
  async recordPayment(details: PaymentDetails): Promise<void> {
    // Define payment data
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

    const itemUpdate: ItemUpdate = { status: 'completed' };

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

    try {
      // Start a transaction
      const { data: paymentResult, error: paymentError } = await supabase
        .from('payments')
        .insert([paymentData]);

      if (paymentError) throw new Error(`Error recording payment: ${paymentError.message}`);
      if (!paymentResult) throw new Error('Payment creation returned no data.');

      const { data: itemResult, error: itemError } = await supabase
        .from('items')
        .update(itemUpdate)
        .eq('id', details.itemId);

      if (itemError) throw new Error(`Error updating item: ${itemError.message}`);
      if (!itemResult) throw new Error('Item update returned no data.');

      const { data: notificationResult, error: notificationError } = await supabase
        .from('notifications')
        .insert([notification]);

      if (notificationError) throw new Error(`Error creating notification: ${notificationError.message}`);
      if (!notificationResult) throw new Error('Notification creation returned no data.');

      console.log('Payment recorded successfully');
    } catch (error) {
      console.error('Error in recordPayment:', error);
      throw error; // Rethrow to ensure errors propagate correctly
    }
  }
};