import axios from 'axios';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export interface Product {
  title: string;
  imageUrl?: string;
  price: number;
  condition?: string;
  brand?: string;
  description?: string;
  category?: string;
}

export async function searchProductsByQuery(query: string) {
  try {
    const response = await axios.post(`${SUPABASE_URL}/functions/v1/search`, {
      query
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const items = response.data.results || [];
    return items.map((item: any) => ({
      title: item.title || 'No Title',
      imageUrl: item.imageUrl || '',
      price: item.price || 0,
      condition: item.condition || 'Unknown',
      brand: item.brand || 'Unknown',
      description: item.shortDescription || item.title || '',
      category: 'Unknown'
    }));
  } catch (error) {
    console.error('Failed to load search:', error);
    return [];
  }
}
