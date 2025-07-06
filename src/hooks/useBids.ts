import { useState, useEffect, useCallback } from 'react';
import { Bid } from '../types';
import { bidService } from '../services/bidService';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';

export const useBids = () => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { auth, role } = useUser();

  const fetchBids = useCallback(async () => {
    if (!auth.user?.id) {
      setLoading(false);
      return;
    }
    
    try {
      setError(null);
      const data = role === 'buyer' 
        ? await bidService.getReceivedBids(auth.user.id)
        : await bidService.getBidsForItem(auth.user.id);
      setBids(data);
    } catch (err) {
      console.error('Failed to fetch bids:', err);
      setError('Failed to fetch bids');
    } finally {
      setLoading(false);
    }
  }, [auth.user?.id, role]);

  useEffect(() => {
    fetchBids();

    // Set up real-time subscription for bid changes
    const subscription = supabase
      .channel('user_bids_updates')
      .on('postgres_changes', {
        event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'bids'
      }, async (payload) => {
        console.log('Real-time user bids update received:', payload);
        
        // Refetch bids to get the most current data
        if (auth.user?.id) {
          try {
            const updatedData = role === 'buyer' 
              ? await bidService.getReceivedBids(auth.user.id)
              : await bidService.getBidsForItem(auth.user.id);
            setBids(updatedData);
          } catch (err) {
            console.error('Error refetching bids:', err);
          }
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchBids, auth.user?.id, role]);

  return { bids, loading, error };
};