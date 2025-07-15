import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const useSupabase = () => {
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const checkConnection = async () => {
      try {
        // Add timeout for connection check
        const connectionPromise = supabase
          .from('profiles')
          .select('count')
          .limit(1);

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 5000)
        );

        await Promise.race([connectionPromise, timeoutPromise]);

        if (mounted) {
          setConnected(true);
        }
      } catch (error) {
        console.error('Supabase connection error:', error);

        if (mounted && retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying connection... (${retryCount}/${maxRetries})`);
          setTimeout(checkConnection, 2000 * retryCount);
          return;
        }

        if (mounted) {
          setConnected(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkConnection();

    return () => {
      mounted = false;
    };
  }, []);

  return { loading, connected };
};