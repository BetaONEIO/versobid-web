import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { ProfileHeaderProps } from './types';

export const ProfileInfo: React.FC<ProfileHeaderProps> = ({ profile, isOwnProfile }) => {
  return (
    <div className="flex-1">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {isOwnProfile ? profile.full_name : profile.username}
      </h1>
      {profile.bio && (
        <p className="mt-2 text-gray-600 dark:text-gray-300">{profile.bio}</p>
      )}
      <div className="mt-2 flex items-center">
        <StarIcon className="h-5 w-5 text-yellow-400" />
        <span className="ml-1 text-gray-600 dark:text-gray-300">
          {profile.average_rating?.toFixed(1) || 'No ratings yet'}
        </span>
      </div>
    </div>
  );
};