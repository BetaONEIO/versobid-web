import { Rating } from '../../../types/profile';

export const calculateAverageRating = (ratings: Rating[]): number => {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
  return Number((sum / ratings.length).toFixed(1));
};

export const calculateTotalRatings = (ratings: Rating[]): number => {
  return ratings.length;
};

export const calculateRatingDistribution = (ratings: Rating[]): Record<number, number> => {
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratings.forEach(rating => {
    distribution[rating.rating]++;
  });
  return distribution;
};