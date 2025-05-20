import { EbaySearchResponse } from './types';
import { SearchResult } from '../../types/search';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export const ebayService = {
  async searchItems(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) {
      return [];
    }

    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/ebay-search?q=${encodeURIComponent(query)}`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`eBay search error: ${response.statusText}`);
      }

      const data: EbaySearchResponse = await response.json();
      return (data.itemSummaries || []).map(item => ({
        title: item.title || '',
        imageUrl: item.image?.imageUrl,
        price: item.price ? parseFloat(item.price.value) : undefined,
        condition: item.condition,
        shortDescription: item.shortDescription,
        itemLocation: item.itemLocation && {
          country: item.itemLocation.country,
          postalCode: item.itemLocation.postalCode || 'Unknown'
        },
        seller: item.seller ? {
          username: item.seller.username,
          feedbackScore: item.seller.feedbackScore
        } : undefined
      }));
    } catch (error) {
      console.error('Error searching eBay items:', error);
      throw error;
    }
  }
};