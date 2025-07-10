import React, { useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext';
import { profileService } from '../services/profileService';
import { ListingGrid } from '../components/listings/ListingGrid';
import { useListings } from '../hooks/useListings';
import { Profile as ProfileType } from '../types/profile';
import { PayPalLinkButton } from '../components/profile/PayPalLinkButton';
import { ImageEditor } from '../components/profile/ImageEditor';
import { CameraIcon, PencilIcon } from '@heroicons/react/24/outline';

export const Profile: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { username } = useParams<{ username: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { auth, refreshUserData } = useUser();
  const { addNotification } = useNotification();
  const [profile, setProfile] = React.useState<ProfileType | null>(null);
  const { listings } = useListings({ 
    forceOwnListings: true,
    userId: profile?.id
  });
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [selectedImageFile, setSelectedImageFile] = React.useState<File | null>(null);
  const [showImageEditor, setShowImageEditor] = React.useState(false);
  const [editData, setEditData] = React.useState({
    full_name: '',
    shipping_address: {
      street: '',
      city: '',
      postcode: '',
      country: ''
    }
  });

  const isOwnProfile = auth.user?.username === username;
  const defaultAvatar = '/default-avatar.png';
  React.useEffect(() => {
    const fetchProfile = async () => {
      console.log('fetching definitely runs everytime ')
      try {
        console.log('username', username);
        const data = await profileService.getProfileByUsername(username!);
        console.log('data', data);
        setProfile(data);
        
        // Initialize edit data
        if (data && isOwnProfile) {
          const address = data.shipping_address || { street: '', city: '', postcode: '', country: '' };
          setEditData({
            full_name: data.full_name || '',
            shipping_address: {
              street: address.street || '',
              city: address.city || '',
              postcode: address.postcode || '',
              country: address.country || ''
            }
          });
        }
      } catch (error) {
        console.log(error)
        addNotification('error', 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, addNotification, isOwnProfile]);

  // Check for edit mode from URL parameter
  React.useEffect(() => {
    const editParam = searchParams.get('edit');
    if (editParam === 'true' && isOwnProfile) {
      setIsEditMode(true);
    }
  }, [searchParams, isOwnProfile]);

  const handleAvatarClick = () => {
    if (isOwnProfile && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.user?.id) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      addNotification('error', 'Image size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      addNotification('error', 'Please select a valid image file');
      return;
    }

    setSelectedImageFile(file);
    setShowImageEditor(true);
  };

  const handleSaveCroppedImage = async (croppedFile: File) => {
    if (!auth.user?.id) return;

    try {
      setUploading(true);
      const avatarUrl = await profileService.uploadAvatar(croppedFile, auth.user.id);
      await profileService.updateProfile(auth.user.id, {
        avatar_url: avatarUrl
      });
      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
      addNotification('success', 'Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      addNotification('error', 'Failed to update profile picture');
    } finally {
      setUploading(false);
      setSelectedImageFile(null);
    }
  };

  // const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file || !auth.user?.id) return;

  //   try {
  //     setUploading(true);
  //     const avatarUrl = await profileService.uploadAvatar(file, auth.user.id);
  //     await profileService.updateProfile(auth.user.id, {
  //       avatar_url: avatarUrl
  //     });
  //     setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
  //     addNotification('success', 'Profile picture updated successfully');
  //   } catch (error) {
  //     console.error('Error uploading avatar:', error);
  //     addNotification('error', 'Failed to update profile picture');
  //   } finally {
  //     setUploading(false);
  //   }
  // };

  const handleEditToggle = () => {
    if (isEditMode) {
      // Cancel edit - remove edit parameter from URL
      setSearchParams({});
    } else {
      // Enter edit mode - add edit parameter to URL
      setSearchParams({ edit: 'true' });
    }
    setIsEditMode(!isEditMode);
  };

  const handleSaveProfile = async () => {
    if (!auth.user?.id) return;

    setSaving(true);
    try {
      await profileService.updateProfile(auth.user.id, {
        full_name: editData.full_name,
        shipping_address: editData.shipping_address
      });

      // Update local state
      setProfile(prev => prev ? {
        ...prev,
        full_name: editData.full_name,
        shipping_address: editData.shipping_address
      } : null);

      // Refresh user data in context
      await refreshUserData();

      addNotification('success', 'Profile updated successfully');
      setIsEditMode(false);
      setSearchParams({});
    } catch (error) {
      console.error('Error updating profile:', error);
      addNotification('error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string, isAddress = false) => {
    if (isAddress) {
      setEditData(prev => ({
        ...prev,
        shipping_address: {
          ...prev.shipping_address,
          [field]: value
        }
      }));
    } else {
      setEditData(prev => ({
        ...prev,
        [field]: value
      }));
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
            <div className="relative group">
              {/* Profile Picture */}
              <div className="relative">
                <img
                  src={profile.avatar_url || defaultAvatar}
                  alt={`${profile.username}'s avatar`}
                  className={`w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover bg-white ${
                    isOwnProfile ? 'cursor-pointer' : 'cursor-default'
                  }`}
                  onClick={handleAvatarClick}
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    if (img.src !== window.location.origin + defaultAvatar) {
                      img.src = defaultAvatar;
                    }
                  }}
                />
                
                {/* Upload Overlay - only shown on hover for own profile */}
                {isOwnProfile && !uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-50 rounded-full transition-all duration-200 cursor-pointer group-hover:opacity-100 opacity-0">
                    <div className="text-center text-white">
                      <CameraIcon className="h-8 w-8 mx-auto mb-1" />
                      <span className="text-xs font-medium select-none">
                        {profile.avatar_url ? 'Change Photo' : 'Add Photo'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Upload Button for own profile when no avatar */}
                {isOwnProfile && !profile.avatar_url && !uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full border-4 border-white dark:border-gray-800">
                    <div className="text-center text-gray-400 dark:text-gray-500">
                      <CameraIcon className="h-12 w-12 mx-auto mb-2" />
                      <span className="text-sm font-medium">Add Photo</span>
                    </div>
                  </div>
                )}

                {/* Upload progress indicator */}
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <div className="text-center text-white">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-1"></div>
                      <span className="text-xs font-medium">Uploading...</span>
                    </div>
                  </div>
                )}

                {/* Edit button for existing avatar */}
                {isOwnProfile && profile.avatar_url && !uploading && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAvatarClick();
                    }}
                    className="absolute bottom-2 right-2 bg-white dark:bg-gray-700 rounded-full p-2 shadow-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    title="Edit profile picture"
                  >
                    <PencilIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </button>
                )}
              </div>

              {/* Hidden file input */}
              {isOwnProfile && (
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                  disabled={uploading}
                />
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
            {isOwnProfile && (
              <div className="mt-4 md:mt-0">
                <button
                  onClick={handleEditToggle}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  disabled={saving}
                >
                  {isEditMode ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
            )}
          </div>

          {/* Edit Mode Form */}
          {isEditMode && isOwnProfile && (
            <div className="mt-8 bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Edit Profile Information
              </h3>
              
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:text-white"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Address Preferences */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                    Address Preferences (Private)
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    This information is private and used for shipping and location-based features.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={editData.shipping_address.street}
                        onChange={(e) => handleInputChange('street', e.target.value, true)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:text-white"
                        placeholder="123 Main Street"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={editData.shipping_address.city}
                        onChange={(e) => handleInputChange('city', e.target.value, true)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:text-white"
                        placeholder="London"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Postcode
                      </label>
                      <input
                        type="text"
                        value={editData.shipping_address.postcode}
                        onChange={(e) => handleInputChange('postcode', e.target.value, true)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:text-white"
                        placeholder="SW1A 1AA"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        value={editData.shipping_address.country}
                        onChange={(e) => handleInputChange('country', e.target.value, true)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:text-white"
                        placeholder="United Kingdom"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={handleEditToggle}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-500"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

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

          {isOwnProfile && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Payment Settings
              </h2>
              <PayPalLinkButton />
            </div>
          )}
        </div>
      </div>

      {/* Image Editor Modal */}
      {selectedImageFile && (
        <ImageEditor
          isOpen={showImageEditor}
          onClose={() => {
            setShowImageEditor(false);
            setSelectedImageFile(null);
          }}
          onSave={handleSaveCroppedImage}
          imageFile={selectedImageFile}
        />
      )}
    </div>
  );
};