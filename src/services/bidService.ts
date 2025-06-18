import { supabase } from '../lib/supabase';
import { Bid, BidStatus } from '../types/bid';
import { Database } from '../types/supabase';
import { notificationService } from './notification/notificationService';

type BidRow = Database['public']['Tables']['bids']['Row'];
type BidInsert = Database['public']['Tables']['bids']['Insert'];
type BidUpdate = Database['public']['Tables']['bids']['Update'];

interface BidWithRelations extends BidRow {
  bidder?: { username: string };
  item?: {
    id: string;
    title: string;
    description: string;
    min_price: number;
    max_price: number;
    seller_id: string;
    buyer_id: string;
    category: string;
    status: string;
    created_at: string;
  };
}

const transformBid = (data: BidWithRelations): Bid => ({
  id: data.id,
  item_id: data.item_id,
  bidder_id: data.bidder_id,
  amount: data.amount,
  message: data.message || '',
  status: data.status,
  created_at: data.created_at,
  counter_amount: data.counter_amount || undefined,
  bidder: data.bidder,
  item: data.item && {
    ...data.item,
    minPrice: data.item.min_price,
    maxPrice: data.item.max_price,
    buyer_id: data.item.buyer_id
  }
});

export const bidService = {
  async createBid(itemId: string, amount: number, message?: string): Promise<Bid | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Check if user has linked PayPal account
      const { data: profile } = await supabase
        .from('profiles')
        .select('paypal_email')
        .eq('id', user.id)
        .single();

      if (!profile?.paypal_email) {
        throw new Error('Please link your PayPal account to place bids');
      }

      const bidData: BidInsert = {
        item_id: itemId,
        bidder_id: user.id,
        amount,
        message: message || null,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('bids')
        .insert(bidData)
        .select(`
          *,
          bidder:profiles(username),
          item:items(
            id,
            title,
            description,
            min_price,
            max_price,
            buyer_id,
            category,
            status,
            created_at
          )
        `)
        .single();

      if (error || !data) return null;
      return transformBid(data);
    } catch (error) {
      if (error instanceof Error) {
        throw error; // Re-throw validation errors with their message
      }
      return null;
    }
  },

  async getBid(bidId: string): Promise<Bid | null> {
    try {
      const { data, error } = await supabase
        .from('bids')
        .select(`
          *,
          bidder:profiles(username),
          item:items(
            id,
            title,
            description,
            min_price,
            max_price,
            seller_id,
            buyer_id,
            category,
            status,
            created_at
          )
        `)
        .eq('id', bidId)
        .single();

      if (error || !data) return null;
      return transformBid(data);
    } catch {
      return null;
    }
  },

  async updateBidStatus(bidId: string, status: BidStatus, counterOffer?: number): Promise<boolean> {
    try {
      console.log('updateBidStatus called with:', { bidId, status, counterOffer });
      
      const updateData: BidUpdate = {
        status
      };

      // If it's a counter offer, also update the counter_amount
      if (status === 'countered' && counterOffer) {
        updateData.counter_amount = counterOffer;
      }

      // If accepting a counter offer, update the amount to the counter amount
      if (status === 'accepted') {
        console.log('Accepted counter offer reacheddddd');
        const currentBid = await this.getBid(bidId);
        console.log('Current bid before update:', currentBid);
        if (currentBid?.counter_amount) {
          updateData.amount = currentBid.counter_amount;
          console.log('Updating amount to counter amount:', currentBid.counter_amount);
        }
      }

      console.log('Update data being sent to database:', updateData);

      // First check if the bid exists
      const { data: existingBid, error: checkError } = await supabase
        .from('bids')
        .select('*')
        .eq('id', bidId)
        .single();
      
      console.log('Existing bid check:', { existingBid, checkError });

      const { error, data } = await supabase
        .from('bids')
        .update(updateData)
        .eq('id', bidId)
        .select();

      console.log('Database update result:', { error, data });

      if (error) {
        console.error('Database update error:', error);
        return false;
      }

      // Get bid details for notifications and item status updates
      const bid = await this.getBid(bidId);
      console.log('Bid after update:', bid);
      if (!bid) return false;

      // If bid is accepted, mark the item as unavailable for others
      if (status === 'accepted' && bid.item) {
        console.log('Marking item as sold:', bid.item_id);
        const { error: itemError } = await supabase
          .from('items')
          .update({ status: 'completed' })
          .eq('id', bid.item_id);

        if (itemError) {
          console.error('Failed to update item status:', itemError);
        }
      }

      // Send notifications based on status
      if (status === 'accepted') {
        console.log('Sending acceptance notifications...');
        // When accepting a counter offer, notify the buyer (item owner)
        if (bid.counter_amount && bid.item?.buyer_id) {
          console.log('Notifying buyer about counter acceptance');
          await notificationService.createNotification({
            user_id: bid.item.buyer_id,
            type: 'bid_accepted',
            message: `Your counter offer of ${bid.counter_amount} for "${bid.item?.title}" has been accepted! Proceed to payment.`,
            data: {
              bidId: bid.id,
              itemId: bid.item_id,
              amount: bid.counter_amount,
              status: 'accepted'
            },
            read: false
          });
        } else if (bid.bidder_id) {
          console.log('Notifying bidder about bid acceptance');
          // Regular bid acceptance - notify the bidder
          await notificationService.createNotification({
            user_id: bid.bidder_id,
            type: 'bid_accepted',
            message: `Your bid of ${bid.amount} for "${bid.item?.title}" has been accepted!`,
            data: {
              bidId: bid.id,
              itemId: bid.item_id,
              amount: bid.amount,
              status: 'accepted'
            },
            read: false
          });
        }
      } else if (status === 'rejected' && bid.bidder_id) {
        await notificationService.createNotification({
          user_id: bid.bidder_id,
          type: 'bid_rejected',
          message: `Your bid of ${bid.amount} for "${bid.item?.title}" has been rejected.`,
          data: {
            bidId: bid.id,
            itemId: bid.item_id,
            amount: bid.amount,
            status: 'rejected'
          },
          read: false
        });
      } else if (status === 'countered' && bid.bidder_id) {
        await notificationService.createNotification({
          user_id: bid.bidder_id,
          type: 'info',
          message: `Your bid for "${bid.item?.title}" has received a counter offer of ${counterOffer}.`,
          data: {
            bidId: bid.id,
            itemId: bid.item_id,
            amount: bid.amount,
            counterAmount: counterOffer,
            status: 'countered'
          },
          read: false
        });
      }

      console.log('updateBidStatus completed successfully');
      return true;
    } catch (error) {
      console.error('updateBidStatus error:', error);
      return false;
    }
  },

  async deleteBid(bidId: string): Promise<boolean> {
    try {
      // Get bid details for notification before deletion
      const bid = await this.getBid(bidId);
      if (!bid) return false;

      // Delete the bid
      const { error } = await supabase
        .from('bids')
        .delete()
        .eq('id', bidId);

      if (error) {
        console.error('Delete bid error:', error);
        return false;
      }

      // Send notification to the item owner if available
      const itemOwnerId = bid.item?.buyer_id;
      if (itemOwnerId) {
        await notificationService.createNotification({
          user_id: itemOwnerId,
          type: 'bid_rejected',
          message: `A bid for your item "${bid.item?.title}" has been withdrawn by the bidder and removed from the system.`,
          data: {
            bidId: bid.id,
            itemId: bid.item_id,
            amount: bid.amount,
            counterAmount: bid.counter_amount,
            status: 'deleted'
          },
          read: false
        });
      }

      // Send notification to the bidder (for consistency, optional)
      if (bid.bidder_id) {
        await notificationService.createNotification({
          user_id: bid.bidder_id,
          type: 'bid_rejected',
          message: `Your counter offer for "${bid.item?.title}" has been rejected and the bid has been removed.`,
          data: {
            bidId: bid.id,
            itemId: bid.item_id,
            amount: bid.amount,
            counterAmount: bid.counter_amount,
            status: 'deleted'
          },
          read: false
        });
      }

      return true;
    } catch {
      return false;
    }
  },

  async getBidsForItem(userId: string): Promise<Bid[]> {
    try {
      const { data, error } = await supabase
        .from('bids')
        .select(`
          *,
          bidder:profiles(username),
          item:items(
            id,
            title,
            description,
            min_price,
            max_price,
            seller_id,
            buyer_id,
            category,
            status,
            created_at
          )
        `)
        .eq('bidder_id', userId)
        .neq('item.status', 'archived')
        .order('created_at', { ascending: false });

      if (error) return [];
      return (data || []).map(transformBid);
    } catch {
      return [];
    }
  },

  async getReceivedBids(userId: string): Promise<Bid[]> {
    try {
      const { data, error } = await supabase
        .from('bids')
        .select(`
          *,
          bidder:profiles(username),
          item:items!inner(
            id,
            title,
            description,
            min_price,
            max_price,
            seller_id,
            buyer_id,
            category,
            status,
            created_at
          )
        `)          
        .eq('item.buyer_id', userId)
        .neq('item.status', 'archived')
        .order('created_at', { ascending: false });

      if (error) return [];
      return (data || []).map(transformBid);
    } catch {
      return [];
    }
  },

  async respondToCounter(bidId: string, accept: boolean): Promise<boolean> {
    try {
      console.log('respondToCounter called with:', { bidId, accept });
      const status = accept ? 'accepted' : 'rejected';
      console.log('About to call updateBidStatus with status:', status);
      // Use updateBidStatus to handle all the complex logic for counter offer acceptance
      const result = await this.updateBidStatus(bidId, status);
      console.log('updateBidStatus returned:', result);
      return result;
    } catch (error) {
      console.error('respondToCounter error:', error);
      return false;
    }
  },

  async cleanupOldPendingBids(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('delete_old_pending_bids');
      if (error) {
        console.error('Error cleaning up old bids:', error);
        return 0;
      }
      return data || 0;
    } catch {
      return 0;
    }
  },

  // async initiatePayment(bidId: string) {
  //   // Create payment session
  //   // Return payment URL
  // }
};