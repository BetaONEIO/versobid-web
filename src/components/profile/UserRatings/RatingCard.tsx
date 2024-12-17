import React from 'react';
import { StarRating } from './StarRating';
import { formatDate } from '../../../utils/formatters';
import { Rating } from '../../../types/profile';

interface RatingCardProps {
  rating: Rating;
}

export const RatingCard: React.FC<RatingCardProps> = ({ rating }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <StarRating rating={rating.rating} />
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
            by {rating.reviewer_name}
          </span>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate(rating.created_at)}
        </span>
      </div>
      {rating.comment && (
        <p className="mt-2 text-gray-600 dark:text-gray-300">{rating.comment}</p>
      )}
    </div>
  );
};