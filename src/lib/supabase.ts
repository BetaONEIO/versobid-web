import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Get environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Validate environment variables
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase credentials. Please configure your environment variables.');
}

// Create Supabase client with enhanced configuration and error handling
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
      storageKey: 'versobid-auth',
      flowType: 'pkce'
    },
    global: {
      headers: {
        'X-Client-Info': 'versobid-web'
      },
      fetch: (url, options = {}) => {
        // Add timeout and better error handling to all requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        return fetch(url, {
          ...options,
          signal: controller.signal,
        }).then(response => {
          clearTimeout(timeoutId);
          return response;
        }).catch(error => {
          clearTimeout(timeoutId);
          // Suppress network errors in development
          if (error.name === 'AbortError' || error.message?.includes('fetch')) {
            console.warn('Network request failed, this is expected if Supabase is not configured');
            throw new Error('Network unavailable');
          }
          throw error;
        });
      }
    },
    db: {
      schema: 'public'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      },
      heartbeatIntervalMs: 30000,
      reconnectAfterMs: (tries: number) => Math.min(tries * 1000, 10000)
    }
  }
);