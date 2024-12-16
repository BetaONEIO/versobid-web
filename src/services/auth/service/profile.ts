import { AuthFormData, User } from '../../../types';
import { profileService } from '../../profileService';

export const createUserProfile = async (userId: string, formData: AuthFormData): Promise<User> => {
  const profile = await profileService.createProfile({
    id: userId,
    email: formData.email,
    username: formData.username,
    full_name: formData.name,
    created_at: new Date().toISOString(),
    avatar_url: null,
  });

  return {
    id: profile.id,
    name: profile.full_name,
    email: profile.email,
    username: profile.username
  };
};