import { SearchResult } from './types';
import { searchProducts } from '../shopping/mockData';

export async function searchItems(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 3) {
    return [];
  }

  try {
    // Filter mock data based on search query
    const results = searchProducts
      .filter(product => 
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.description?.toLowerCase().includes(query.toLowerCase()) ||
        product.brand?.toLowerCase().includes(query.toLowerCase())
      )
      .map(product => ({
        title: product.title,
        imageUrl: product.imageUrl,
        price: product.price,
        condition: product.condition,
        brand: product.brand,
        shortDescription: product.description
      }));

    return results;
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }
}