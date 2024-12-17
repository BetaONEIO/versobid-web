import React from 'react';

interface ProfileAvatarProps {
  username: string;
  avatarUrl: string | null;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ username, avatarUrl }) => {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={username}
        className="h-24 w-24 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
      <span className="text-2xl text-gray-500 dark:text-gray-400">
        {username.charAt(0).toUpperCase()}
      </span>
    </div>
  );
};