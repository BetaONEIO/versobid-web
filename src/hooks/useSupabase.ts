import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const useSupabase = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Just check initial connection
    const checkConnection = async () => {
      try {
        const { error } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);

        if (error) throw error;
      } catch (error) {
        console.error('Supabase connection error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkConnection();
  }, []);

  return { loading };
};