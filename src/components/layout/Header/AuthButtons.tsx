import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLogout } from '../../../hooks/useLogout';

interface AuthButtonsProps {
  isAuthenticated: boolean;
}

export const AuthButtons: React.FC<AuthButtonsProps> = ({ isAuthenticated }) => {
  const location = useLocation();
  const { handleLogout } = useLogout();

  if (!isAuthenticated) {
    return (
      <Link
        to="/signin"
        state={{ from: location }}
        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
      >
        Sign In
      </Link>
    );
  }

  return (
    <button
      onClick={handleLogout}
      type="button"
      className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
    >
      Log Out
    </button>
  );
};