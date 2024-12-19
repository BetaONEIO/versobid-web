import { UserProfile } from '../../../types/profile';

export interface ProfileCreateParams {
  id: string;
  username: string;
  full_name: string;
  email: string;
  created_at: string;
  avatar_url: string | null;
  bio?: string;
}

export interface ProfileUpdateParams extends Partial<ProfileCreateParams> {
  id: string;
}

export interface ProfileServiceInterface {
  getUserProfile(userId: string): Promise<UserProfile>;
  createProfile(params: ProfileCreateParams): Promise<UserProfile>;
  updateProfile(params: ProfileUpdateParams): Promise<UserProfile>;
}