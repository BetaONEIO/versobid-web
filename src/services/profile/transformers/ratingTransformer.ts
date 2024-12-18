import { Rating } from '../../../types/profile';

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

export const transformRating = (rating: RawRating): Rating => ({
  id: rating.id,
  rating: rating.rating,
  comment: rating.comment,
  created_at: rating.created_at,
  reviewer_id: rating.reviewer_id,
  reviewer_name: rating.reviewer?.username || 'Unknown User'
});