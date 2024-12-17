import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { profileService } from '../services/profileService';
import { UserProfile } from '../types/profile';
import { Item } from '../types/item';
import { Bid } from '../types/bid';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { UserItems } from '../components/profile/UserItems';
import { UserBids } from '../components/profile/UserBids';
import { UserRatings } from '../components/profile/UserRatings';

export const Profile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { auth } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = auth.user?.id === userId;

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await profileService.getUserProfile(userId!);
        setProfile(profileData);

        if (isOwnProfile) {
          const [userItems, userBids] = await Promise.all([
            profileService.getUserItems(userId!),
            profileService.getUserBids(userId!)
          ]);
          setItems(userItems);
          setBids(userBids);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId, isOwnProfile]);

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

      {isOwnProfile ? (
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
      ) : null}

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ratings</h2>
        <UserRatings ratings={profile.ratings || []} />
      </div>
    </div>
  );
};