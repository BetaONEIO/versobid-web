import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserRole, AuthState, User } from '../types';
import { supabase } from '../lib/supabase';
import { ExtendedSupabaseUser } from '../types/user';
import { useNotification } from './NotificationContext';
import { PostgrestSingleResponse } from '@supabase/supabase-js';

interface UserContextType {
  role: UserRole;
  toggleRole: () => void;
  auth: AuthState;
  login: (user: User) => void;
  logout: () => void;
}

interface ProfileType {
  id: string;
  full_name: string;
  email: string;
  username: string;
  is_admin: boolean;
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
  const location = useLocation();
  const { addNotification } = useNotification();
  const [role, setRole] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem('userRole');
    return (savedRole as UserRole) || 'buyer';
  });
  const [auth, setAuth] = useState<AuthState>(initialAuthState);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single() as PostgrestSingleResponse<ProfileType>;

          if (!error && profile && mounted) {
            const supabaseUser = session.user as ExtendedSupabaseUser;
            setAuth({
              isAuthenticated: true,
              user: {
                id: profile.id,
                name: profile.full_name,
                email: profile.email,
                username: profile.username,
                is_admin: profile.is_admin || false,
                email_verified: supabaseUser.email_verified || false
              }
            });
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        addNotification('error', 'Failed to load user profile');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user && mounted) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single() as PostgrestSingleResponse<ProfileType>;

          if (!error && profile && mounted) {
            const supabaseUser = session.user as ExtendedSupabaseUser;
            setAuth({
              isAuthenticated: true,
              user: {
                id: profile.id,
                name: profile.full_name,
                email: profile.email,
                username: profile.username,
                is_admin: profile.is_admin || false,
                email_verified: supabaseUser.email_verified || false
              }
            });
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          setAuth(initialAuthState);
        }
      } else if (event === 'SIGNED_OUT' && mounted) {
        setAuth(initialAuthState);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, addNotification, mounted, location.pathname]);

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
    } catch (error) {
      console.error('Error logging out:', error);
      addNotification('error', 'Failed to log out');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ role, toggleRole, auth, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};