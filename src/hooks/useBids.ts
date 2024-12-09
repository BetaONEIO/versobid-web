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
        const mockBids: Bid[] = [
          {
            id: '1',
            title: 'Vintage Camera Collection',
            description: 'A rare collection of vintage cameras from the 1950s, including Leica and Rolleiflex models.',
            amount: 2500,
            createdAt: new Date(),
            status: 'open'
          },
          {
            id: '2',
            title: 'Gaming PC Setup',
            description: 'High-end gaming PC with RTX 4080, 32GB RAM, and 4K monitor.',
            amount: 3500,
            createdAt: new Date(),
            status: 'open'
          },
          {
            id: '3',
            title: 'Handcrafted Leather Sofa',
            description: 'Custom-made Italian leather sofa, perfect condition, barely used.',
            amount: 1800,
            createdAt: new Date(),
            status: 'open'
          }
        ];
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