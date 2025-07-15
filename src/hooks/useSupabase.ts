import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const useSupabase = () => {
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 2;
    let timeoutId: NodeJS.Timeout;

    const checkConnection = async () => {
      if (!mounted) return;

      try {
        // Check if environment variables are configured
        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
          throw new Error('Supabase credentials not configured');
        }

        // Simple connection test with shorter timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const { error } = await supabase
          .from('profiles')
          .select('count')
          .limit(1)
          .abortSignal(controller.signal);

        clearTimeout(timeoutId);

        if (error) throw error;

        if (mounted) {
          setConnected(true);
          setLoading(false);
        }
      } catch (error) {
        if (mounted && retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying connection... (${retryCount}/${maxRetries})`);
          timeoutId = setTimeout(checkConnection, 3000 * retryCount);
          return;
        }

        if (mounted) {
          setConnected(false);
          setLoading(false);
          // Don't log error if it's just an abort signal
          if (error instanceof Error && error.name !== 'AbortError') {
            console.error('Supabase connection failed:', error.message);
          }
        }
      }
    };

    checkConnection();

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return { loading, connected };
};