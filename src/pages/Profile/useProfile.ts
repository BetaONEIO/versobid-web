import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { profileService } from '../../services/profileService';
import { UserProfile } from '../../types/profile';
import { Item } from '../../types/item';
import { Bid } from '../../types/bid';

export const useProfile = () => {
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

  return {
    profile,
    items,
    bids,
    isOwnProfile,
    loading
  };
};