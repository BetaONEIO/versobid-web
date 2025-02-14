import { useState, useEffect } from 'react';
import { Item } from '../types/item';
import { itemService } from '../services/itemService';

export const useListing = (id: string) => {
  const [listing, setListing] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const item = await itemService.getItem(id);
        setListing(item);
      } catch (err) {
        setError('Failed to fetch listing details');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  return { listing, loading, error };
};