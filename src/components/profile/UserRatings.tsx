import React from 'react';
import { Rating } from '../../types/profile';
import { StarIcon } from '@heroicons/react/24/solid';

interface UserRatingsProps {
  ratings: Rating[];
}

export const UserRatings: React.FC<UserRatingsProps> = ({ ratings }) => {
  if (ratings.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        No ratings yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {ratings.map((rating) => (
        <div key={rating.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-5 w-5 ${
                      i < rating.rating
                        ? 'text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                by {rating.reviewer_name}
              </span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(rating.created_at).toLocaleDateString()}
            </span>
          </div>
          {rating.comment && (
            <p className="mt-2 text-gray-600 dark:text-gray-300">{rating.comment}</p>
          )}
        </div>
      ))}
    </div>
  );
};