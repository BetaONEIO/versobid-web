import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole } from '../../../types/user';
import { useUser } from '../../../contexts/UserContext';
import { useNotification } from '../../../contexts/NotificationContext';

interface NavLinksProps {
  role: UserRole;
  isAdmin: boolean;
  username?: string;
  mobile?: boolean;
}

export const NavLinks: React.FC<NavLinksProps> = ({ role, isAdmin, username, mobile = false }) => {
  const { logout } = useUser();
  const navigate = useNavigate();
  const { addNotification } = useNotification();

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
  const sellerLinks = [
    { to: '/', label: 'Home' },
    { to: '/listings', label: 'Browse Items' },
    { to: '/bids', label: 'Bids Sent' },
    { to: `/profile/${username}`, label: 'Profile' },
    { to: '/help', label: 'Help' },
  ];

  const buyerLinks = [
    { to: '/', label: 'Home' },
    { to: '/items/add', label: 'Place a Listing' },
    { to: '/listings', label: 'My Listings' },
    { to: '/bids', label: 'Bids Received' },
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
      {/* to include logout button */}
      <button className={`${baseClasses} cursor-pointer sm:hidden w-full text-left`}
        onClick={handleLogout}
      >
        Logout
      </button>
    </>
  );
};