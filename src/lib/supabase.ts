import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
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

// Initialize auth state with better error handling
supabase.auth.onAuthStateChange(async (event, session) => {
  try {
    if (event === 'SIGNED_IN' && session?.user) {
      // Fetch user profile after sign in
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      // Store user data
      localStorage.setItem('versobid-user-data', JSON.stringify({
        id: session.user.id,
        email: session.user.email,
        profile
      }));

      console.log('User signed in successfully');
    } else if (event === 'SIGNED_OUT') {
      localStorage.removeItem('versobid-user-data');
      console.log('User signed out successfully');
    } else if (event === 'TOKEN_REFRESHED') {
      console.log('Auth token refreshed successfully');
    }
  } catch (error) {
    console.error('Auth state change error:', error);
    // Clear potentially corrupted data
    localStorage.removeItem('versobid-user-data');
    // Attempt to recover session
    await supabase.auth.getSession();
  }
});

// Add error event listener
window.addEventListener('unhandledrejection', async (event) => {
  if (event.reason?.message?.includes('AuthRetryableFetchError')) {
    console.log('Handling auth error, attempting to recover session...');
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (!session) {
        // Clear stored data if no valid session
        localStorage.removeItem('versobid-user-data');
        window.location.href = '/signin';
      }
    } catch (error) {
      console.error('Failed to recover session:', error);
      localStorage.removeItem('versobid-user-data');
      window.location.href = '/signin';
    }
  }
});