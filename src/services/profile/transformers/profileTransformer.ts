import { DbProfile } from '../../../types/supabase';
import { UserProfile, Rating } from '../../../types/profile';
import { calculateAverageRating } from '../utils/calculations';

interface RawRating {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer_id: string;
  reviewer?: {
    username: string;
  };
}

interface ProfileWithRatings extends DbProfile {
  ratings?: RawRating[];
}

const transformRating = (rating: RawRating): Rating => ({
  id: rating.id,
  rating: rating.rating,
  comment: rating.comment,
  created_at: rating.created_at,
  reviewer_id: rating.reviewer_id,
  reviewer_name: rating.reviewer?.username || 'Unknown User'
});

export const transformProfile = (data: ProfileWithRatings): UserProfile => {
  const ratings = (data.ratings || []).map(transformRating);
  
  return {
    id: data.id,
    username: data.username,
    full_name: data.full_name,
    email: data.email,
    avatar_url: data.avatar_url,
    bio: data.bio,
    created_at: data.created_at,
    ratings,
    average_rating: calculateAverageRating(ratings)
  };
};