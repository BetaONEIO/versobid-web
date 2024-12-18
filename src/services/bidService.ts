import { supabase } from '../lib/supabase';
import { Bid, BidStatus, CreateBidParams, BidServiceResponse } from '../types/bid';
import { emailService } from './emailService';

export const bidService = {
  async createBid(params: CreateBidParams): Promise<BidServiceResponse> {
    try {
      const { data, error } = await supabase
        .from('bids')
        .insert([{
          item_id: params.itemId,
          bidder_id: params.bidderId,
          amount: params.amount,
          message: params.message,
          shipping_option: params.shippingOption,
          status: 'pending',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        return { 
          success: false, 
          message: error.message 
        };
      }

      // Notify seller
      const { data: item } = await supabase
        .from('items')
        .select('title, seller_id')
        .eq('id', params.itemId)
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
            params.amount,
            params.itemId
          );
        }
      }

      return { 
        success: true, 
        message: 'Bid created successfully.',
        bid: data as Bid
      };
    } catch (error) {
      console.error('Error creating bid:', error);
      return { 
        success: false, 
        message: 'An unexpected error occurred.' 
      };
    }
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