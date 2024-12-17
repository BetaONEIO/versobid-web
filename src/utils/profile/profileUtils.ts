import { Rating } from '../../types/profile';

export const calculateAverageRating = (ratings: Rating[]): number => {
  if (!ratings.length) return 0;
  return ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length;
};

export const formatProfileName = (fullName: string, username: string, isOwnProfile: boolean): string => {
  return isOwnProfile ? fullName : username;
};