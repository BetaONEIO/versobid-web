import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { getEnvVar, validateEnv } from '../utils/env';

// Validate environment variables
if (!validateEnv()) {
  console.error('[Supabase] Environment validation failed');
  throw new Error('Invalid environment configuration');
}

// Get environment variables
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', true)!;
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', true)!;

console.log('[Supabase] Initializing client with config:', {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  timestamp: new Date().toISOString()
});

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

// Initialize auth state with error handling
supabase.auth.onAuthStateChange((event, session) => {
  try {
    console.log('[Supabase] Auth state change:', {
      event,
      userId: session?.user?.id,
      email: session?.user?.email,
      timestamp: new Date().toISOString()
    });

    if (event === 'SIGNED_IN') {
      console.log('[Supabase] User signed in:', {
        email: session?.user?.email,
        id: session?.user?.id,
        timestamp: new Date().toISOString()
      });
    } else if (event === 'SIGNED_OUT') {
      console.log('[Supabase] User signed out');
      localStorage.removeItem('versobid-user-data');
    }
  } catch (error) {
    console.error('[Supabase] Auth state change error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
});