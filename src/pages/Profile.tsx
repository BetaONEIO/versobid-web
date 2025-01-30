import React, { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext';
import { profileService } from '../services/profileService';
import { ListingGrid } from '../components/listings/ListingGrid';
import { useListings } from '../hooks/useListings';
import { Profile as ProfileType } from '../types/profile';

export const Profile: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { username } = useParams<{ username: string }>();
  const { auth } = useUser();
  const { addNotification } = useNotification();
  const { listings } = useListings();
  const [profile, setProfile] = React.useState<ProfileType | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const isOwnProfile = auth.user?.username === username;
  const defaultAvatar = '/default-avatar.png';

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!username) return;
        const data = await profileService.getProfileByUsername(username);
        setProfile(data);
      } catch (error) {
        addNotification('error', 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, addNotification]);

  const handleAvatarClick = () => {
    if (isOwnProfile && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.user?.id) return;

    try {
      setUploading(true);
      const avatarUrl = await profileService.uploadAvatar(file, auth.user.id);
      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
      addNotification('success', 'Profile picture updated successfully');
      setSelectedImage(null);
    } catch (error) {
      addNotification('error', 'Failed to update profile picture');
      setSelectedImage(null);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-lg text-gray-600 dark:text-gray-300">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-lg text-red-600 dark:text-red-400">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="relative h-32 bg-gradient-to-r from-indigo-500 to-purple-600">
          <div className="absolute -bottom-16 left-8">
            <div className="relative">
              <img
                src={profile.avatar_url || defaultAvatar}
                alt={`${profile.username}'s avatar`}
                className={`w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover bg-white cursor-${isOwnProfile ? 'pointer' : 'default'}`}
                onClick={handleAvatarClick}
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = defaultAvatar;
                }}
              />
              {isOwnProfile && (
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={uploading}
                />
              )}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-20 px-8 pb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.username}</h1>
              <p className="text-gray-600 dark:text-gray-300">{profile.full_name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Member since {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {isOwnProfile ? 'Your Listings' : `${profile.username}'s Listings`}
            </h2>
            {listings.length > 0 ? (
              <ListingGrid listings={listings} />
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No items listed yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};