// deno-lint-ignore-file
// This file can be deleted// supabase/functions/ebay-token/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts'

const EBAY_CLIENT_ID = Deno.env.get("EBAY_CLIENT_ID");
const EBAY_CLIENT_SECRET = Deno.env.get("EBAY_CLIENT_SECRET");
const EBAY_TOKEN_URL = "https://api.ebay.com/identity/v1/oauth2/token";
const EBAY_API_URL = "https://api.ebay.com/buy/browse/v1/item_summary/search";

// In-memory cache (for demonstration; use Supabase KV for production)
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getEbayAppToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now) {
    return cachedToken.token;
  }

  if (!EBAY_CLIENT_ID || !EBAY_CLIENT_SECRET) {
    throw new Error("eBay credentials not configured");
  }

  const credentials = btoa(`${EBAY_CLIENT_ID}:${EBAY_CLIENT_SECRET}`);
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    scope: "https://api.ebay.com/oauth/api_scope"
  });

  const response = await fetch(EBAY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  if (!response.ok) {
    throw new Error(`Failed to get eBay token: ${response.statusText}`);
  }

  const data = await response.json();
  // expires_in is in seconds
  cachedToken = {
    token: data.access_token,
    expiresAt: now + (data.expires_in - 60) * 1000 // renew 1 min before expiry
  };
  return cachedToken.token;
}

async function searchEbayItems(query: string, token: string) {
  const response = await fetch(
    `${EBAY_API_URL}?q=${encodeURIComponent(query)}&limit=50`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_GB'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`eBay API error: ${response.statusText}`);
  }

  return response.json();
}

serve(async (req) => {
  try {
    // Handle CORS
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
      });
    }

    const url = new URL(req.url);
    const query = url.searchParams.get('q');

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    const token = await getEbayAppToken();
    const results = await searchEbayItems(query, token);

    return new Response(
      JSON.stringify(results),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  } catch (error:any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
});