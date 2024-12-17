import React from 'react';
import { ProfileAvatar } from './ProfileAvatar';
import { ProfileInfo } from './ProfileInfo';
import { ProfileHeaderProps } from './types';

export const ProfileHeaderContent: React.FC<ProfileHeaderProps> = ({ profile, isOwnProfile }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex items-center space-x-6">
        <ProfileAvatar username={profile.username} avatarUrl={profile.avatar_url} />
        <ProfileInfo profile={profile} isOwnProfile={isOwnProfile} />
      </div>
    </div>
  );
};