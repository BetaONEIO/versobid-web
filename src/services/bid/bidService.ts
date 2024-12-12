import { supabase } from '../../lib/supabase';
import { emailService } from '../email';
import { CreateBidParams, UpdateBidStatusParams, BidServiceResponse } from './types';

class BidService {
  async createBid(params: CreateBidParams): Promise<BidServiceResponse> {
    try {
      const { data: bid, error } = await supabase
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

      if (error) throw error;

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
        message: 'Bid created successfully',
        bid
      };
    } catch (error) {
      console.error('Error creating bid:', error);
      return {
        success: false,
        message: 'Failed to create bid'
      };
    }
  }

  async updateBidStatus({ bidId, status }: UpdateBidStatusParams): Promise<BidServiceResponse> {
    try {
      const { error } = await supabase
        .from('bids')
        .update({ status })
        .eq('id', bidId);

      if (error) throw error;

      if (status === 'accepted') {
        const { data: bid } = await supabase
          .from('bids')
          .select(`
            *,
            items (
              title,
              seller_id,
              profiles (
                full_name
              )
            ),
            profiles (
              email
            )
          `)
          .eq('id', bidId)
          .single();

        if (bid) {
          await emailService.sendBidAcceptedEmail(
            bid.profiles.email,
            bid.items.title,
            bid.amount,
            bid.items.profiles.full_name,
            `/payment/${bidId}`
          );
        }
      }

      return {
        success: true,
        message: `Bid ${status} successfully`
      };
    } catch (error) {
      console.error('Error updating bid status:', error);
      return {
        success: false,
        message: `Failed to update bid status to ${status}`
      };
    }
  }
}

export const bidService = new BidService();