import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { RoleToggle } from '../ui/RoleToggle';

export const Header: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { auth, logout } = useUser();

  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-gray-900 dark:text-white">
              VersoBid
            </Link>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            {auth.isAuthenticated && (
              <Link
                to="/bids"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 dark:text-gray-100"
              >
                Bids
              </Link>
            )}
            {!auth.isAuthenticated ? (
              <Link
                to="/signin"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Sign In
              </Link>
            ) : (
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
              >
                Log Out
              </button>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {auth.isAuthenticated && <RoleToggle />}
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
          </div>
        </div>
      </nav>
    </header>
  );
};