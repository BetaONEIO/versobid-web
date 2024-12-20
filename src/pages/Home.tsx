import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { FeaturedBids } from '../components/bids/FeaturedBids';
import { TrendingCategories } from '../components/home/TrendingCategories';
import { HowItWorks } from '../components/home/HowItWorks';

export const Home: React.FC = () => {
  const { auth, role } = useUser();

  if (auth.isAuthenticated) {
    return (
      <div className="bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              <span className="block">Welcome Back!</span>
              <span className="block text-indigo-600 dark:text-indigo-400">
                {role === 'buyer' ? 'Find Your Next Deal' : 'Manage Your Listings'}
              </span>
            </h1>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                to="/bids"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                {role === 'buyer' ? 'Browse Bids' : 'My Listings'}
              </Link>
              <Link
                to={role === 'seller' ? '/bids/new' : '/bids/saved'}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-indigo-400 dark:hover:bg-gray-700"
              >
                {role === 'seller' ? 'Create Listing' : 'Saved Items'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              <span className="block">Welcome to VersoBid</span>
              <span className="block text-indigo-600 dark:text-indigo-400">
                Your Global Bidding Platform
              </span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Join thousands of users buying and selling items through our secure bidding platform.
              Start your journey today!
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  to="/signup"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                >
                  Get Started
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link
                  to="/signin"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 md:py-4 md:text-lg md:px-10"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <HowItWorks />

      {/* Trending Categories */}
      <TrendingCategories />

      {/* Featured Bids Section */}
      <FeaturedBids />
    </div>
  );
};