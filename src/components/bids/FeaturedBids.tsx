import React from 'react';
import { Link } from 'react-router-dom';
import { BidCard } from './BidCard';
import { useBids } from '../../hooks/useBids';

export const FeaturedBids: React.FC = () => {
  const { bids, loading, error } = useBids();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[30vh]">
        <div className="text-gray-600 dark:text-gray-300">Loading featured bids...</div>
      </div>
    );
  }

  if (error) {
    return null;
  }

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Featured Bids
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300 sm:mt-4">
            Discover the latest opportunities on VersoBid
          </p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {bids.slice(0, 3).map((bid) => (
            <div key={bid.id} className="relative">
              <BidCard bid={bid} />
              <div className="mt-4 text-center">
                <Link
                  to="/signin"
                  className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                >
                  Sign in to bid
                  <svg
                    className="ml-2 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};