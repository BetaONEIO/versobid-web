import { useState, useEffect } from 'react';
import { Bid } from '../types';
import { bidService } from '../services/bidService';
import { useUser } from '../contexts/UserContext';

export const useBids = () => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { auth } = useUser();

  useEffect(() => {
    const fetchBids = async () => {
      if (!auth.user?.id) return;
      
      try {
        const data = await bidService.getBidsForItem(auth.user.id);
        setBids(data);
      } catch (err) {
        setError('Failed to fetch bids');
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, [auth.user?.id]);

  return { bids, loading, error };
};