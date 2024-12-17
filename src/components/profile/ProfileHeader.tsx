import React from 'react';
import { UserProfile } from '../../types/profile';
import { StarIcon } from '@heroicons/react/24/solid';

interface ProfileHeaderProps {
  profile: UserProfile;
  isOwnProfile: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, isOwnProfile }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex items-center space-x-6">
        <div className="flex-shrink-0">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-2xl text-gray-500 dark:text-gray-400">
                {profile.username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
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
      </div>
    </div>
  );
};