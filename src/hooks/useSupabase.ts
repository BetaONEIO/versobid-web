import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext';
import { User } from '../types/user';

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
            const user: User = {
              id: profile.id,
              name: profile.full_name,
              email: profile.email,
              username: profile.username,
              is_admin: profile.is_admin || false,
              email_verified: false,
              shipping_address: profile.shipping_address,
              payment_setup: profile.payment_setup,
              onboarding_completed: profile.onboarding_completed
            };
            
            login(user);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          addNotification('error', 'Failed to load user profile');
          logout();
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