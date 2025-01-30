import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';
import { getEnvVar, validateEnv } from '../utils/env';

// Validate environment variables
if (!validateEnv()) {
  console.error('[Supabase] Environment validation failed');
  throw new Error('Invalid environment configuration');
}

// Get environment variables
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', true)!;
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', true)!;

// Create Supabase client with enhanced configuration
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
      flowType: 'pkce',
      debug: true
    },
    global: {
      headers: {
        'X-Client-Info': 'versobid-web'
      }
    },
    db: {
      schema: 'public'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);