import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const SERPAPI_KEY = Deno.env.get('SERPAPI_KEY');
const BASE_URL = 'https://serpapi.com/search.json';

interface SearchResponse {
  results: Array<{
    title: string;
    imageUrl?: string;
    price?: number;
    condition?: string;
    brand?: string;
    shortDescription?: string;
  }>;
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

// Logger utility
const logger = {
  info: (message: string, data?: any) => {
    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      message,
      ...data && { data }
    }));
  },
  error: (message: string, error?: any) => {
    console.error(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      message,
      ...(error && {
        error: {
          message: error.message,
          stack: error.stack,
          ...error
        }
      })
    }));
  },
  warn: (message: string, data?: any) => {
    console.warn(JSON.stringify({
      level: 'warn',
      timestamp: new Date().toISOString(),
      message,
      ...data && { data }
    }));
  }
};

serve(async (req) => {
  const requestId = crypto.randomUUID();
  const startTime = performance.now();

  // Log request
  logger.info('Search request received', {
    requestId,
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });

  // Handle CORS
  if (req.method === 'OPTIONS') {
    logger.info('CORS preflight request', { requestId });
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate API key
    if (!SERPAPI_KEY) {
      logger.error('SERPAPI_KEY not configured', { requestId });
      throw new Error('SERPAPI_KEY environment variable not configured');
    }

    // Parse request body
    const { query } = await req.json();
    logger.info('Request parsed', { requestId, query });
    
    if (!query || query.length < 3) {
      logger.warn('Invalid query', { requestId, query });
      return new Response(
        JSON.stringify({ results: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      );
    }

    // Build search parameters
    const params = new URLSearchParams({
      api_key: SERPAPI_KEY,
      engine: 'google_shopping',
      q: query,
      google_domain: 'google.co.uk',
      gl: 'uk',
      hl: 'en',
      currency: 'GBP',
      safe: 'active'
    });

    // Log SerpAPI request
    logger.info('Making SerpAPI request', {
      requestId,
      endpoint: BASE_URL,
      params: Object.fromEntries(params)
    });

    // Make request to SerpAPI
    const response = await fetch(`${BASE_URL}?${params}`);
    
    if (!response.ok) {
      logger.error('SerpAPI request failed', {
        requestId,
        status: response.status,
        statusText: response.statusText
      });
      throw new Error(`SerpAPI request failed: ${response.statusText}`);
    }

    const data = await response.json();
    logger.info('SerpAPI response received', {
      requestId,
      resultCount: data.shopping_results?.length || 0
    });

    if (!data.shopping_results) {
      logger.warn('No shopping results found', { requestId });
      return new Response(
        JSON.stringify({ results: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      );
    }

    // Transform results
    const results = data.shopping_results.map((item: any) => ({
      title: item.title,
      imageUrl: item.thumbnail,
      price: parseFloat(item.price?.replace(/[^0-9.]/g, '') || '0'),
      condition: item.condition || 'New',
      brand: item.brand || '',
      shortDescription: item.snippet || ''
    }));

    // Calculate price analysis
    const prices = results
      .map(r => r.price)
      .filter((p): p is number => !isNaN(p) && p > 0);

    let priceAnalysis;
    if (prices.length > 0) {
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      priceAnalysis = {
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

    const searchResponse: SearchResponse = {
      results,
      ...(priceAnalysis && { priceAnalysis })
    };

    // Log success response
    const endTime = performance.now();
    logger.info('Search completed successfully', {
      requestId,
      duration: Math.round(endTime - startTime),
      resultCount: results.length,
      hasPriceAnalysis: !!priceAnalysis
    });

    return new Response(
      JSON.stringify(searchResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );

  } catch (error) {
    // Log error with full details
    logger.error('Search error occurred', {
      requestId,
      error,
      duration: Math.round(performance.now() - startTime)
    });
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
        requestId
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})