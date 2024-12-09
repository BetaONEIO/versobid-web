import React from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserToggle from './UserToggle';
import ThemeToggle from './ThemeToggle';
import { useAuthStore } from '../stores/authStore';

export default function Header() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (!user) return null;

  return (
    <header className="bg-indigo-600 dark:bg-indigo-800 text-white transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="text-2xl font-bold">
              <span className="text-white">Verso</span>
              <span className="text-red-500">Bid</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <UserToggle />
            <ThemeToggle />
            <button
              onClick={handleSignOut}
              className="flex items-center text-white hover:text-indigo-100"
            >
              <LogOut className="h-5 w-5 mr-1" />
              Sign Out
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}