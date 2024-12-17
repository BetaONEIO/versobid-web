import { UserProfile } from '../../types/profile';
import { Item } from '../../types/item';
import { Bid } from '../../types/bid';
import { profileQueries } from './queries/profileQueries';
import { itemQueries } from './queries/itemQueries';
import { bidQueries } from './queries/bidQueries';
import { ProfileNotFoundError } from './errors';
import { validateProfileData } from './validation/profileValidation';
import { ProfileValidationError } from './errors/ProfileValidationError';
import { transformProfile } from './transformers/profileTransformer';

class ProfileService {
  async getUserProfile(userId: string): Promise<UserProfile> {
    const { data: profile, error } = await profileQueries.getProfile(userId);
    if (error) throw error;
    if (!profile) throw new ProfileNotFoundError(userId);

    return transformProfile(profile);
  }

  async createProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    const validationErrors = validateProfileData(profileData);
    if (validationErrors.length > 0) {
      throw new ProfileValidationError(validationErrors);
    }

    const { data: profile, error } = await profileQueries.create(profileData);
    if (error) throw error;
    if (!profile) throw new Error('Failed to create profile');

    return transformProfile(profile);
  }

  async getUserItems(userId: string): Promise<Item[]> {
    const { data, error } = await itemQueries.getUserItems(userId);
    if (error) throw error;

    return data || [];
  }

  async getUserBids(userId: string): Promise<Bid[]> {
    const { data, error } = await bidQueries.getUserBids(userId);
    if (error) throw error;

    return data || [];
  }
}

export const profileService = new ProfileService();