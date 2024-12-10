import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext';

export const useSupabase = () => {
  const { login, logout } = useUser();
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            login({
              id: profile.id,
              name: profile.full_name,
              email: profile.email,
              username: profile.username,
              bids: []
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          addNotification('error', 'Failed to load user profile');
        }
      } else if (event === 'SIGNED_OUT') {
        logout();
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [login, logout, addNotification]);

  return { loading };
};