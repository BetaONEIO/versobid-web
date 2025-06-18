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
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

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
  };

  const refreshUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user && auth.isAuthenticated) {
      try {
        const userData = await fetchProfileData(session.user.id, session.user.email_confirmed_at);
        if (userData) {
          setAuth({
            isAuthenticated: true,
            user: userData
          });
        }
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        try {
          const userData = await fetchProfileData(session.user.id, session.user.email_confirmed_at);
          if (userData) {
            setAuth({
              isAuthenticated: true,
              user: userData
            });
          }
        } catch (error) {
          console.error('Error fetching profile on session restore:', error);
        }
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const userData = await fetchProfileData(session.user.id, session.user.email_confirmed_at);
        if (userData) {
          setAuth({
            isAuthenticated: true,
            user: userData
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setAuth(initialAuthState);
      }
    });

    return () => {
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