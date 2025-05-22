import axios from 'axios';
import { supabase } from '../../lib/supabase';

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

let searchProducts: Product[] = [];

export async function searchProductsByQuery(query: string) {
  try {
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session found');
    }

    const response = await axios.post(`${SUPABASE_URL}/functions/v1/search`, {
      query
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
    });

    const items = response.data.results || [];
    searchProducts = items.map((item: any) => ({
      title: item.title || 'No Title',
      imageUrl: item.imageUrl || '',
      price: item.price || 0,
      condition: item.condition || 'Unknown',
      brand: item.brand || 'Unknown',
      description: item.shortDescription || item.title || '',
      category: 'Unknown'
    }));

    return searchProducts;

  } catch (error) {
    console.error('Failed to load search:', error);
    return [];
  }
}
export { searchProducts };

