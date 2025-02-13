import { useState, useEffect } from 'react';
import { Item } from '../types/item';
import { itemService } from '../services/itemService';
import { useUser } from '../contexts/UserContext';

export const useListings = () => {
  const [listings, setListings] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { role, auth } = useUser();

  const fetchListings = async (search?: string) => {
    try {
      let filters;
      if (role === 'buyer') {
        // Buyers see their own listings
        filters = { 
          seller_id: auth.user?.id,
          search
        };
      } else {
        // Sellers see all active listings except their own
        filters = { 
          status: 'active',
          exclude_seller: auth.user?.id,
          search
        };
      }
      
      const items = await itemService.getItems(filters);
      setListings(items);
    } catch (err) {
      setError('Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchListings();
    } else {
      setLoading(false);
    }
  }, [role, auth.user?.id, auth.isAuthenticated]);

  const searchListings = (query: string) => {
    setLoading(true);
    fetchListings(query);
  };

  return { listings, loading, error, searchListings };
};