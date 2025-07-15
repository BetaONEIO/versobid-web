import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const useSupabase = () => {
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkConnection = async () => {
      try {
        // Simple connection test
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        
        if (mounted) {
          setConnected(!error);
          setLoading(false);
        }
      } catch (error) {
        console.error('Supabase connection error:', error);
        if (mounted) {
          setConnected(false);
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