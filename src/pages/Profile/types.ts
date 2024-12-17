import { UserProfile } from '../../types/profile';
import { Item } from '../../types/item';
import { Bid } from '../../types/bid';

export interface ProfileContentProps {
  profile: UserProfile;
  items: Item[];
  bids: Bid[];
  isOwnProfile: boolean;
  loading?: boolean;
}