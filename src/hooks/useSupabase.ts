import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext';
import { User } from '../types/user';
import { Database } from '../types/database';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export const useSupabase = () => {
  const { login, logout } = useUser();
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error) throw error;
          if (!profile) throw new Error('Profile not found');

          const user: User = {
            id: profile.id,
            name: profile.full_name,
            email: profile.email,
            username: profile.username,
            is_admin: profile.is_admin || false,
            email_verified: session.user.email_confirmed_at !== null,
            shipping_address: profile.shipping_address || undefined,
            payment_setup: profile.payment_setup || false,
            onboarding_completed: profile.onboarding_completed || false,
            rating: profile.rating
          };
          
          login(user);
        } catch (error) {
          console.error('Error fetching user profile:', error);
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