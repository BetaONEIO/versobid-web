import { supabase } from '../lib/supabase';
import { Transaction, RatingFormData } from '../types/transaction';

export const transactionService = {
  async getTransaction(bidId: string): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        seller_rating:ratings!seller_rating_id(*),
        buyer_rating:ratings!buyer_rating_id(*)
      `)
      .eq('bid_id', bidId)
      .single();

    if (error) throw error;
    return data;
  },

  async submitRating(
    transactionId: string,
    userId: string,
    userType: 'seller' | 'buyer',
    ratingData: RatingFormData
  ): Promise<void> {
    const { data: rating, error: ratingError } = await supabase
      .from('ratings')
      .insert([{
        ...ratingData,
        reviewer_id: userId,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (ratingError) throw ratingError;

    const updateField = userType === 'seller' ? 'seller_rating_id' : 'buyer_rating_id';
    const { error: transactionError } = await supabase
      .from('transactions')
      .update({ [updateField]: rating.id })
      .eq('id', transactionId);

    if (transactionError) throw transactionError;
  }
};