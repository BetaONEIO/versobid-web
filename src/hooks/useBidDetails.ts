import { useState, useEffect } from 'react';
import { Bid } from '../types/bid';
import { bidService } from '../services/bidService';
import { useUser } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext';
import { supabase } from '../lib/supabase';

export const useBidDetails = (bidId: string | undefined) => {
  const { auth } = useUser();
  const { addNotification } = useNotification();
  const [bid, setBid] = useState<Bid | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBid = async () => {
      if (!bidId || !auth.user?.id) return;
      
      try {
        const foundBid = await bidService.getBid(bidId);
        if (foundBid) {
          // Verify user can access this bid (they're either the bidder or item owner)
          const isBidder = foundBid.bidder_id === auth.user.id;
          const itemLister = foundBid.item?.buyer_id === auth.user.id; 
          
          if (isBidder || itemLister) {
            setBid(foundBid);
          } else {
            setError('You do not have permission to view this bid');
          }
        } else {
          setError('Bid not found');
        }
      } catch (err) {
        console.error('Failed to fetch bid:', err);
        setError('Failed to load bid details');
      } finally {
        setLoading(false);
      }
    };

    fetchBid();

    // Set up real-time subscription for this specific bid
    if (bidId) {
      const subscription = supabase
        .channel(`bid_${bidId}_updates`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'bids',
          filter: `id=eq.${bidId}`
        }, async (payload) => {
          console.log('Real-time bid update received:', payload);
          
          // Refetch the complete bid data when it's updated
          try {
            const updatedBid = await bidService.getBid(bidId);
            if (updatedBid) {
              setBid(updatedBid);
              
              // Show notification about the update
              const newBid = payload.new as any;
              const oldBid = payload.old as any;
              
              if (newBid.status !== oldBid?.status) {
                let message = '';
                switch (newBid.status) {
                  case 'accepted':
                    message = 'Bid has been accepted!';
                    break;
                  case 'rejected':
                    message = 'Bid has been rejected.';
                    break;
                  case 'countered':
                    message = 'A counter offer has been made.';
                    break;
                  default:
                    message = 'Bid status has been updated.';
                }
                addNotification('info', message);
              }
            }
          } catch (err) {
            console.error('Error fetching updated bid:', err);
          }
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [bidId, auth.user?.id, addNotification]);

  return { bid, loading, error, setBid };
}; 