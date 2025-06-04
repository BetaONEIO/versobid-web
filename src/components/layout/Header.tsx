import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';
import { SunIcon, MoonIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { RoleToggle } from '../ui/RoleToggle';
import { NotificationBell } from '../ui/NotificationBell';
import { useNotification } from '../../contexts/NotificationContext';
import { NavLinks } from './navigation/NavLinks';

export const Header: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { auth, role, logout } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      addNotification('success', 'Successfully logged out');
      navigate('/signin');
    } catch (error) {
      console.error('Error logging out:', error);
      addNotification('error', 'Failed to log out. Please try again.');
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              VersoBid
            </Link>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            {auth.isAuthenticated && (
              <NavLinks 
                role={role} 
                isAdmin={auth.user?.is_admin || false} 
                username={auth.user?.username}
              />
            )}
            {!auth.isAuthenticated && (
              <Link
                to="/signin"
                state={{ from: location }}
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Sign In
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {auth.isAuthenticated && (
              <>
                <NotificationBell />
                <RoleToggle />
              </>
            )}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isDarkMode ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>

            {auth.isAuthenticated && (
              <button
                onClick={handleLogout}
                className="hidden sm:inline-flex items-center px-3 py-1 text-sm font-medium text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
              >
                Log Out
              </button>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="sm:hidden absolute top-16 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700 max-h-[calc(100vh-4rem)] overflow-y-auto z-50">
            <div className="pt-2 pb-3 space-y-1">
              {auth.isAuthenticated && (
                <NavLinks 
                  role={role} 
                  isAdmin={auth.user?.is_admin || false} 
                  username={auth.user?.username}
                  mobile={true}
                />
              )}
              {!auth.isAuthenticated && (
                <Link
                  to="/signin"
                  state={{ from: location }}
                  className="block px-3 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
