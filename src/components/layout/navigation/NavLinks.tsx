import React from 'react';
import { Link } from 'react-router-dom';
import { UserRole } from '../../../types/user';

interface NavLinksProps {
  role: UserRole;
  isAdmin: boolean;
  username?: string;
  mobile?: boolean;
}

export const NavLinks: React.FC<NavLinksProps> = ({ role, isAdmin, username, mobile = false }) => {
  const sellerLinks = [
    { to: '/', label: 'Home' },
    { to: '/listings', label: 'Browse Items' },
    { to: '/bids/received', label: 'My Bids' },
    { to: `/profile/${username}`, label: 'Profile' },
    { to: '/help', label: 'Help' },
  ];

  const buyerLinks = [
    { to: '/', label: 'Home' },
    { to: '/items/add', label: 'Post Wanted Item' },
    { to: '/listings', label: 'My Listings' },
    { to: '/bids', label: 'My Bids' },
    { to: `/profile/${username}`, label: 'Profile' },
    { to: '/help', label: 'Help' },
  ];

  const links = role === 'seller' ? sellerLinks : buyerLinks;
  const baseClasses = mobile
    ? "block px-3 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
    : "inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 dark:text-gray-100";

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className={baseClasses}
        >
          {link.label}
        </Link>
      ))}
      {isAdmin && (
        <Link
          to="/admin"
          className={mobile
            ? "block px-3 py-2 text-base font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            : "inline-flex items-center px-3 pt-1 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          }
        >
          Admin Panel
        </Link>
      )}
    </>
  );
};