import { useState, useEffect } from 'react';
import { Bid } from '../types';

export const useBids = () => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        // In a real application, this would be an API call
        // For now, we start with an empty array
        const mockBids: Bid[] = [];
        setBids(mockBids);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch bids');
        setLoading(false);
      }
    };

    fetchBids();
  }, []);

  return { bids, loading, error };
};