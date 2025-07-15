import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const useSupabase = () => {
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 5;
    let retryTimeout: NodeJS.Timeout;

    const checkConnection = async () => {
      try {
        // Simple health check that doesn't require table access
        const { error } = await supabase.rpc('version');
        
        if (error && error.message.includes('function version() does not exist')) {
          // Function doesn't exist, but connection is working
          if (mounted) {
            setConnected(true);
            setLoading(false);
          }
          return;
        }

        if (error) throw error;

        if (mounted) {
          setConnected(true);
          setLoading(false);
        }
      } catch (error) {
        console.error('Supabase connection error:', error);

        if (mounted && retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying connection... (${retryCount}/${maxRetries})`);
          
          // Exponential backoff: 1s, 2s, 4s, 8s, 16s
          const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 16000);
          
          retryTimeout = setTimeout(() => {
            if (mounted) {
              checkConnection();
            }
          }, delay);
          return;
        }

        if (mounted) {
          setConnected(false);
          setLoading(false);
        }
      }
    };

    checkConnection();

    return () => {
      mounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, []);

  return { loading, connected };
};