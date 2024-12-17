import React from 'react';
import { ProfileHeader } from '../../components/profile/ProfileHeader';
import { UserItems } from '../../components/profile/UserItems';
import { UserBids } from '../../components/profile/UserBids';
import { UserRatings } from '../../components/profile/UserRatings';
import { ProfileContentProps } from './types';

export const ProfileContent: React.FC<ProfileContentProps> = ({
  profile,
  items,
  bids,
  isOwnProfile,
  loading
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-gray-600 dark:text-gray-300">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-300">
        Profile not found
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} />

      {isOwnProfile && (
        <>
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Items</h2>
            <UserItems items={items} />
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Bids</h2>
            <UserBids bids={bids} />
          </div>
        </>
      )}

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ratings</h2>
        <UserRatings ratings={profile.ratings || []} />
      </div>
    </div>
  );
};