import { supabase } from '../lib/supabase';

export const canUserBidOnItem = async (userId: string, itemId: string): Promise<boolean> => {
  try {
    // Get the item details including seller_id
    const { data: item } = await supabase
      .from('items')
      .select('seller_id')
      .eq('id', itemId)
      .single();

    if (!item) {
      throw new Error('Item not found');
    }

    // User cannot bid on their own item
    return item.seller_id !== userId;
  } catch (error) {
    console.error('Error checking bid eligibility:', error);
    return false;
  }
};