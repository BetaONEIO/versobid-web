import { supabase } from '../../lib/supabase';

// Types for the parameters and response
export interface CreateBidParams {
  itemId: string;
  bidderId: string;
  amount: number;
  message?: string;
  shippingOption: string;
}

export interface CreateBidResponse {
  success: boolean;
  message?: string;
}

export interface UpdateBidStatusResponse {
  success: boolean;
  message?: string;
}

// Bid Service Class
export class BidService {
  // Create a new bid
  async createBid(params: CreateBidParams): Promise<CreateBidResponse> {
    try {
      const { error } = await supabase
        .from('bids')
        .insert([
          {
            item_id: params.itemId,
            bidder_id: params.bidderId,
            amount: params.amount,
            message: params.message,
            shipping_option: params.shippingOption,
            status: 'pending',
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) {
        return { success: false, message: error.message };
      }

      return { success: true, message: 'Bid created successfully.' };
    } catch (e) {
      console.error('Error creating bid:', e);
      return { success: false, message: 'An unexpected error occurred.' };
    }
  }

  // Update the status of an existing bid
  async updateBidStatus(
    bidId: string,
    status: 'accepted' | 'rejected' | 'countered'
  ): Promise<UpdateBidStatusResponse> {
    try {
      const { error } = await supabase
        .from('bids')
        .update({ status })
        .eq('id', bidId);

      if (error) {
        return { success: false, message: error.message };
      }

      return { success: true, message: `Bid ${status} successfully.` };
    } catch (e) {
      console.error('Error updating bid status:', e);
      return { success: false, message: `Failed to update bid status to ${status}.` };
    }
  }
}

// Export a singleton instance of the BidService
export const bidService = new BidService();