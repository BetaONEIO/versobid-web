import { supabase } from '../lib/supabase';
import { Bid, BidStatus } from '../types/bid';
import { emailService } from './emailService';

export const bidService = {
  async createBid(bid: Partial<Bid>): Promise<Bid> {
    const { data, error } = await supabase
      .from('bids')
      .insert([{
        ...bid,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    // Notify seller
    const { data: item } = await supabase
      .from('items')
      .select('title, seller_id')
      .eq('id', bid.itemId)
      .single();

    if (item) {
      const { data: seller } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', item.seller_id)
        .single();

      if (seller) {
        await emailService.sendBidNotificationEmail(
          seller.email,
          item.title,
          bid.amount!,
          bid.itemId!
        );
      }
    }

    return data;
  },

  async updateBidStatus(bidId: string, status: BidStatus): Promise<void> {
    const { error } = await supabase
      .from('bids')
      .update({ status })
      .eq('id', bidId);

    if (error) throw error;

    if (status === 'accepted') {
      // Get bid details
      const { data: bid } = await supabase
        .from('bids')
        .select('*, items(*), profiles(*)')
        .eq('id', bidId)
        .single();

      if (bid) {
        // Send acceptance email to buyer
        await emailService.sendBidAcceptedEmail(
          bid.profiles.email,
          bid.items.title,
          bid.amount,
          bid.items.seller_name,
          `/payment/${bidId}`
        );
      }
    }
  }
};