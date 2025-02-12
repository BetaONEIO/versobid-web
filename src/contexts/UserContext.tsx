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

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setAuth({
            isAuthenticated: true,
            user: {
              id: profile.id,
              name: profile.full_name,
              email: profile.email,
              username: profile.username,
              is_admin: profile.is_admin || false,
              email_verified: session.user.email_confirmed_at !== null,
              shipping_address: profile.shipping_address,
              payment_setup: profile.payment_setup,
              onboarding_completed: profile.onboarding_completed
            }
          });
        }
      }
    };

    checkSession();
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
    <UserContext.Provider value={{ role, toggleRole, auth, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};