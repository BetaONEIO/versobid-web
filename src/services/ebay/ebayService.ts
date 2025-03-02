import { EbaySearchResponse } from './types';
import { SearchResult } from '../../types/search';

const EBAY_API_URL = import.meta.env.VITE_EBAY_API_URL;
const EBAY_TOKEN = import.meta.env.VITE_EBAY_API_TOKEN;

// Rate limiting configuration
const RATE_LIMIT = 5; // requests per second
const RATE_WINDOW = 1000; // 1 second in milliseconds
let lastRequestTime = 0;
let requestCount = 0;

const rateLimiter = async () => {
  const now = Date.now();
  if (now - lastRequestTime >= RATE_WINDOW) {
    // Reset counter for new window
    requestCount = 0;
    lastRequestTime = now;
  } else if (requestCount >= RATE_LIMIT) {
    // Wait until next window
    const waitTime = RATE_WINDOW - (now - lastRequestTime);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    requestCount = 0;
    lastRequestTime = Date.now();
  }
  requestCount++;
};

export const ebayService = {
  async searchItems(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) {
      return [];
    }

    try {
      await rateLimiter();

      console.log('Searching eBay API:', {
        url: EBAY_API_URL,
        query,
        hasToken: !!EBAY_TOKEN
      });

      const response = await fetch(
        `${EBAY_API_URL}/item_summary/search?q=${encodeURIComponent(query)}&limit=50`, 
        {
          headers: {
            'Authorization': `Bearer ${EBAY_TOKEN}`,
            'Content-Type': 'application/json',
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_GB'
          }
        }
      );

      if (!response.ok) {
        console.error('eBay API error:', {
          status: response.status,
          statusText: response.statusText
        });
        throw new Error(`eBay API error: ${response.statusText}`);
      }

      const data: EbaySearchResponse = await response.json();
      console.log('eBay API response:', {
        itemCount: data.itemSummaries?.length || 0
      });

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