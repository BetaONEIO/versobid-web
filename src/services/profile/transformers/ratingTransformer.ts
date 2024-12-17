import { DbRating } from '../../../types/supabase';
import { Rating } from '../../../types/profile';

export const transformRating = (data: DbRating & { reviewer?: { username: string } }): Rating => {
  return {
    id: data.id,
    rating: data.rating,
    comment: data.comment,
    created_at: data.created_at,
    reviewer_id: data.reviewer_id,
    reviewer_name: data.reviewer?.username || 'Unknown User'
  };
};

export const calculateAverageRating = (ratings: Rating[]): number => {
  if (ratings.length === 0) return 0;
  return ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length;
};