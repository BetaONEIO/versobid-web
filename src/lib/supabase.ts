import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Use the same credentials as the integration client for consistency
const supabaseUrl = 'https://srefxubqmfxgkgzjncfr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyZWZ4dWJxbWZ4Z2tnempuY2ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5MDk1OTksImV4cCI6MjA1MDQ4NTU5OX0.ZHzMMp8BP3NQbqlSDHK-KgNydp_BmViLVUCNL2sH6as';

// Create Supabase client with basic configuration
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
      storageKey: 'versobid-auth'
    },
    global: {
      headers: {
        'X-Client-Info': 'versobid-web'
      }
    }
  }
);