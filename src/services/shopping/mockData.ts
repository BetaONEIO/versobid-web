import axios from 'axios';

const EBAY_ACCESS_TOKEN = import.meta.env.VITE_EBAY_ACCESS_TOKEN;

export interface Product {
  title: string;
  imageUrl: string;
  price: number;
  condition: string;
  brand: string;
  description: string;
  category: string;
}

let searchProducts: Product[] = []; 

(async () => {
  try {
    const response = await axios.get('https://api.ebay.com/buy/browse/v1/item_summary/search', {
      params: {
        q: 'iPhone',
        limit: 5,
      },
      headers: {
        Authorization: `Bearer ${EBAY_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    const items = response.data.itemSummaries || [];

    searchProducts = items.map((item: any) => ({
      title: item.title || 'No Title',
      imageUrl: item.image?.imageUrl || '',
      price: parseFloat(item.price?.value) || 0,
      condition: item.condition || 'Unknown',
      brand: item.brand || 'Unknown',
      description: item.shortDescription || item.title || '',
      category: item.categoryPath || 'Unknown'
    }));

    console.log('Item search');
  } catch (error) {
    console.error('Failed to load search:', error);
  }
})();

export { searchProducts };
