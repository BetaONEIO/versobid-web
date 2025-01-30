import React from 'react';
import { useUser } from '../../../contexts/UserContext';
import { Logo } from './Logo';
import { NavLinks } from '../navigation/NavLinks';
import { AuthButtons } from './AuthButtons';
import { ThemeToggle } from './ThemeToggle';
import { RoleToggle } from '../../ui/RoleToggle';

export const Header: React.FC = () => {
  const { auth, role } = useUser();

  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <Logo />
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            {auth.isAuthenticated && (
              <NavLinks role={role} isAdmin={auth.user?.is_admin || false} />
            )}
            <AuthButtons isAuthenticated={auth.isAuthenticated} />
          </div>
          <div className="flex items-center space-x-4">
            {auth.isAuthenticated && <RoleToggle />}
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
};