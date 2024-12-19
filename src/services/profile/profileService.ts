import { UserProfile } from '../../types/profile';
import { Item } from '../../types/item';
import { Bid } from '../../types/bid';
import { DbItem, DbBid } from '../../types/supabase';
import { profileQueries } from './queries/profileQueries';
import { itemQueries } from './queries/itemQueries';
import { bidQueries } from './queries/bidQueries';
import { ProfileNotFoundError } from './errors';
import { validateProfileData } from './validation/profileValidation';
import { ProfileValidationError } from './errors/ProfileValidationError';
import { transformProfile } from './transformers/profileTransformer';
import { itemTransformer } from './transformers/ItemTransformer';
import { bidTransformer } from './transformers/BidTransformer';
import { ProfileServiceInterface, ProfileCreateParams, ProfileUpdateParams } from './types/profileTypes';

class ProfileService implements ProfileServiceInterface {
  async getUserProfile(userId: string): Promise<UserProfile> {
    const { data: profile, error } = await profileQueries.getProfile(userId);
    if (error) throw error;
    if (!profile) throw new ProfileNotFoundError(userId);

    return transformProfile(profile);
  }

  async createProfile(params: ProfileCreateParams): Promise<UserProfile> {
    const validationErrors = validateProfileData(params);
    if (validationErrors.length > 0) {
      throw new ProfileValidationError(validationErrors);
    }

    const { data: profile, error } = await profileQueries.create(params);
    if (error) throw error;
    if (!profile) throw new Error('Failed to create profile');

    return transformProfile(profile);
  }

  async updateProfile(params: ProfileUpdateParams): Promise<UserProfile> {
    const { data: profile, error } = await profileQueries.update(params);
    if (error) throw error;
    if (!profile) throw new Error('Failed to update profile');

    return transformProfile(profile);
  }

  async getUserItems(userId: string): Promise<Item[]> {
    const { data, error } = await itemQueries.getUserItems(userId);
    if (error) throw error;
    return data ? itemTransformer.transformMany(data as DbItem[]) : [];
  }

  async getUserBids(userId: string): Promise<Bid[]> {
    const { data, error } = await bidQueries.getUserBids(userId);
    if (error) throw error;
    return data ? bidTransformer.transformMany(data as DbBid[]) : [];
  }
}

export const profileService = new ProfileService();