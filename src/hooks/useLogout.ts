import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext';
import { supabase } from '../lib/supabase';

export const useLogout = () => {
  const navigate = useNavigate();
  const { logout } = useUser();
  const { addNotification } = useNotification();

  const handleLogout = async () => {
    try {
      // First sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Then clear the local state
      logout();
      
      // Finally redirect and show success message
      navigate('/signin', { replace: true });
      addNotification('success', 'Successfully logged out');
    } catch (error) {
      console.error('Error logging out:', error);
      addNotification('error', 'Failed to log out. Please try again.');
    }
  };

  return { handleLogout };
};