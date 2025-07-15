import React from 'react';
import { Link } from 'react-router-dom';

export const Logo: React.FC = () => (
  <div className="flex-shrink-0">
    <Link to="/" className="text-2xl font-bold text-gray-900 dark:text-white">
      VersoBid
    </Link>
  </div>
);