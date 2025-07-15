
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';

export const Logo: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className="flex-shrink-0">
      <Link to="/" className="flex items-center">
        <img 
          src="/logo.png" 
          alt="VersoBid Logo" 
          className="h-8 w-auto"
        />
        <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
          VersoBid
        </span>
      </Link>
    </div>
  );
};
