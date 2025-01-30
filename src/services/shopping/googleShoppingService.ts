import { SearchResult } from '../../types/search';
import { mockProducts } from './mockData';

interface SearchResponse {
  results: SearchResult[];
  priceAnalysis?: {
    suggestedRange: {
      minPrice: number;
      maxPrice: number;
      marketPrice: number;
    };
    confidence: string;
    basedOn: number;
    note: string;
  };
}

class GoogleShoppingService {
  private static instance: GoogleShoppingService | null = null;

  private constructor() {
    console.log('Local Shopping Service initialized');
  }

  public static getInstance(): GoogleShoppingService {
    if (!GoogleShoppingService.instance) {
      GoogleShoppingService.instance = new GoogleShoppingService();
    }
    return GoogleShoppingService.instance;
  }

  private searchMockProducts(query: string): SearchResult[] {
    const searchTerms = query.toLowerCase().split(' ');
    
    return mockProducts
      .filter(product => {
        const searchText = `${product.title} ${product.brand} ${product.description} ${product.category}`.toLowerCase();
        return searchTerms.every(term => searchText.includes(term));
      })
      .map(product => ({
        title: product.title,
        imageUrl: product.imageUrl,
        price: product.price,
        condition: product.condition,
        brand: product.brand,
        shortDescription: product.description
      }));
  }

  private calculatePriceAnalysis(results: SearchResult[]): SearchResponse['priceAnalysis'] | undefined {
    const prices = results
      .map(r => r.price)
      .filter((p): p is number => p !== undefined && !isNaN(p) && p > 0);

    if (prices.length === 0) return undefined;

    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    
    return {
      suggestedRange: {
        minPrice: Math.floor(avgPrice * 0.85),
        maxPrice: Math.ceil(avgPrice * 1.15),
        marketPrice: Math.round(avgPrice)
      },
      confidence: prices.length > 3 ? 'high' : 'medium',
      basedOn: prices.length,
      note: 'Based on current market prices (±15%)'
    };
  }

  async searchProducts(query: string): Promise<SearchResponse> {
    if (!query || query.length < 3) {
      return { results: [] };
    }

    try {
      // Add artificial delay to simulate network request
      await new Promise(resolve => setTimeout(resolve, 300));

      // Search mock products
      const results = this.searchMockProducts(query);

      // Calculate price analysis
      const priceAnalysis = this.calculatePriceAnalysis(results);

      return {
        results,
        ...(priceAnalysis && { priceAnalysis })
      };
    } catch (error) {
      console.error('Error searching products:', error);
      throw error instanceof Error ? error : new Error('Failed to search products');
    }
  }
}

export const googleShoppingService = GoogleShoppingService.getInstance();