import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useListings } from '../hooks/useListings';
import { ListingGrid } from '../components/listings/ListingGrid';
import { TrendingCategories } from '../components/home/TrendingCategories';
import { HowItWorks } from '../components/home/HowItWorks';

export const Home: React.FC = () => {
  const { auth, role } = useUser();
  const { listings, loading, error } = useListings();

  useEffect(() => {
    console.log('Home component - Auth state:', auth);
    console.log('Home component - User role:', role);
    console.log('Home component - Loading state:', loading);
    console.log('Home component - Error state:', error);
  }, [auth, role, loading, error]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600 dark:text-gray-300">Loading your dashboard...</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">Please wait while we fetch your data</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-red-600 dark:text-red-400">Failed to load data</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (auth.isAuthenticated) {
    // Determine if user is a first-time user based on onboarding status
    const isFirstTimeUser = !auth.user?.onboarding_completed;
    const welcomeMessage = isFirstTimeUser ? 'Welcome!' : 'Welcome Back!';

    return (
      <div className="bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              <span className="block">{welcomeMessage}</span>
              <span className="block text-indigo-600 dark:text-indigo-400">
                {role === 'seller' ? 'Find Buyers for Your Items' : 'Find What You Need'}
              </span>
            </h1>
            <div className="mt-8 flex justify-center gap-4">
              {role === 'seller' ? (
                <Link
                  to="/listings"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Browse Items
                </Link>
              ) : (
                <Link
                  to="/items/add"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Post Wanted Item
                </Link>
              )}
            </div>
          </div>

          {listings.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Browse what others are looking for
              </h2>
              <ListingGrid listings={listings.slice(0, 6)} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Not authenticated - show public homepage
  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            <span className="block">Welcome to VersoBid</span>
            <span className="block text-indigo-600 dark:text-indigo-400">
              Your Global Bidding Platform
            </span>
          </h1>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Get Started
            </Link>
            <Link
              to="/signin"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-indigo-400 dark:hover:bg-gray-700"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      <HowItWorks />
      <TrendingCategories />
    </div>
  );
};