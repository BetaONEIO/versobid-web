import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useListings } from '../hooks/useListings';
import { ListingGrid } from '../components/listings/ListingGrid';
import { TrendingCategories } from '../components/home/TrendingCategories';
import { HowItWorks } from '../components/home/HowItWorks';

export const Home: React.FC = () => {
  const { auth, role } = useUser();
  const { listings, loading } = useListings();

  useEffect(() => {
    console.log('Auth state:', auth);
    console.log('User role:', role);
  }, [auth, role]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (auth.isAuthenticated) {
    return (
      <div className="bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              <span className="block">Welcome Back!</span>
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

          {!loading && listings.length > 0 && (
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