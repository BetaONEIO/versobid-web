import { Rating } from '../../types/profile';

export const transformProfileData = (profile: any) => {
  const ratings = (profile.ratings || []).map((r: any) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    created_at: r.created_at,
    reviewer_id: r.reviewer_id,
    reviewer_name: r.reviewer?.username || 'Unknown User'
  }));

  const averageRating = ratings.length > 0
    ? ratings.reduce((acc: number, curr: Rating) => acc + curr.rating, 0) / ratings.length
    : 0;

  return {
    ...profile,
    average_rating: averageRating,
    ratings
  };
};