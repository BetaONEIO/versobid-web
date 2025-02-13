import { useState, useEffect } from 'react';
import { Item } from '../../types/item';
import { itemService } from '../../services/itemService';

export const useItem = (id: string) => {
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const data = await itemService.getItem(id);
        setItem(data);
      } catch (err) {
        setError('Failed to fetch item details');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  return { item, loading, error };
};