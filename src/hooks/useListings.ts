import { useState, useEffect, useCallback } from 'react';
import { Item } from '../types/item';
import { itemService } from '../services/itemService';
import { useUser } from '../contexts/UserContext';

interface UseListingsOptions {
  forceOwnListings?: boolean; // Force showing only user's own listings regardless of role
  userId?: string; // Specific user ID to fetch listings for
}

export const useListings = (options: UseListingsOptions = {}) => {
  const [listings, setListings] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { role, auth } = useUser();

  // berhubungan dengan backend untuk get list item
  const fetchListings = useCallback(async (search?: string) => {
    try {
      setError(null);
      let filters;
      
      if (options.forceOwnListings && options.userId) {
        // Show listings for a specific user (for profile pages)
        filters = { 
          buyer_id: options.userId,
          status: 'active',
          search
        };
      } else if (options.forceOwnListings) {
        // Force showing only current user's own listings (both as buyer and seller)
        filters = { 
          buyer_id: auth.user?.id,
          status: 'active',
          search
        };
      } else if (role === 'buyer') {
        // Buyers see their own listings (items they want to buy)
        filters = { 
          buyer_id: auth.user?.id,
          status: 'active', // Only show active listings
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
      console.log('Fetched items:', items); // Debug log
      setListings(items);
    } catch (err) {
      console.error('Failed to fetch listings:', err);
      setError('Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  }, [role, auth.user?.id, options.forceOwnListings, options.userId]);

  useEffect(() => {
    if (auth.isAuthenticated || options.userId) {
      fetchListings();
    } else {
      setLoading(false);
      setListings([]); // Clear listings when not authenticated
    }
  }, [auth.isAuthenticated, fetchListings]);

  const searchListings = useCallback((query: string) => {
    setLoading(true);
    fetchListings(query);
  }, [fetchListings]);

  return { listings, loading, error, searchListings, refreshListings: fetchListings };
};