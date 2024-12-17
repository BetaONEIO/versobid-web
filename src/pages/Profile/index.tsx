import React from 'react';
import { Loading } from '../../components/ui/Loading';
import { ProfileContent } from './ProfileContent';
import { useProfile } from './useProfile';

export const Profile: React.FC = () => {
  const { profile, items, bids, isOwnProfile, loading } = useProfile();

  if (loading) {
    return <Loading message="Loading profile..." />;
  }

  if (!profile) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-300">
        Profile not found
      </div>
    );
  }

  return (
    <ProfileContent
      profile={profile}
      items={items}
      bids={bids}
      isOwnProfile={isOwnProfile}
    />
  );
};