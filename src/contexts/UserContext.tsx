import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole, AuthState, User } from '../types';
import { supabase } from '../lib/supabase';
import { useNotification } from './NotificationContext';

interface UserContextType {
  role: UserRole;
  toggleRole: () => void;
  auth: AuthState;
  login: (user: User) => void;
  logout: () => void;
  loading: boolean;
  refreshUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [role, setRole] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem('userRole');
    return (savedRole as UserRole) || 'buyer';
  });
  const [auth, setAuth] = useState<AuthState>(initialAuthState);
  const [loading, setLoading] = useState(true);

  const fetchProfileData = async (userId: string, emailConfirmedAt: string | null | undefined) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      if (profile) {
        return {
          id: profile.id,
          name: profile.full_name,
          email: profile.email,
          username: profile.username,
          is_admin: profile.is_admin || false,
          email_verified: emailConfirmedAt !== null && emailConfirmedAt !== undefined,
          shipping_address: profile.shipping_address,
          payment_setup: profile.payment_setup,
          onboarding_completed: profile.onboarding_completed,
          paypal_email: profile.paypal_email
        };
      }
      return null;
    } catch (error) {
      console.error('Error in fetchProfileData:', error);
      return null;
    }
  };

  const refreshUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && auth.isAuthenticated) {
        const userData = await fetchProfileData(session.user.id, session.user.email_confirmed_at);
        if (userData) {
          setAuth({
            isAuthenticated: true,
            user: userData
          });
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    const initializeAuth = async () => {
      try {
        // Check if Supabase is configured
        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
          console.warn('Supabase not configured, skipping auth initialization');
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        // Add timeout with AbortController
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 8000);

        const { data: { session }, error } = await supabase.auth.getSession();

        if (timeoutId) clearTimeout(timeoutId);

        if (error) {
          // Only throw if it's not a network error
          if (!error.message?.includes('fetch') && !error.message?.includes('Failed to fetch')) {
            throw error;
          }
          console.warn('Auth session check failed due to network issues');
          return;
        }

        if (!mounted) return;

        if (session?.user) {
          const userData = await fetchProfileData(session.user.id, session.user.email_confirmed_at);
          if (userData && mounted) {
            setAuth({
              isAuthenticated: true,
              user: userData
            });
          }
        }
      } catch (error) {
        if (timeoutId) clearTimeout(timeoutId);
        if (mounted) {
          setAuth({
            isAuthenticated: false,
            user: null
          });
          // Only log error if it's not an abort signal
          if (error instanceof Error && error.name !== 'AbortError') {
            console.error('Auth initialization error:', error.message);
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Set up auth state listener with error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      try {
        if (event === 'SIGNED_OUT' || !session) {
          setAuth({
            isAuthenticated: false,
            user: null
          });
          setLoading(false);
        } else if (event === 'SIGNED_IN' && session.user) {
          const userData = await fetchProfileData(session.user.id, session.user.email_confirmed_at);
          if (userData && mounted) {
            setAuth({
              isAuthenticated: true,
              user: userData
            });
          }
          setLoading(false);
        }
      } catch (error) {
        if (mounted) {
          setLoading(false);
          if (error instanceof Error) {
            console.error('Auth state change error:', error.message);
          }
        }
      }
    });

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const toggleRole = () => {
    const newRole = role === 'buyer' ? 'seller' : 'buyer';
    setRole(newRole);
    localStorage.setItem('userRole', newRole);
  };

  const login = (user: User) => {
    setAuth({
      isAuthenticated: true,
      user,
    });
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setAuth(initialAuthState);
      navigate('/signin');
      addNotification('success', 'Successfully logged out');
    } catch (error) {
      console.error('Error logging out:', error);
      addNotification('error', 'Failed to log out');
    }
  };

  return (
    <UserContext.Provider value={{ role, toggleRole, auth, login, logout, loading, refreshUserData }}>
      {children}
    </UserContext.Provider>
  );
};