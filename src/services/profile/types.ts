import { Database } from '../../types/supabase';
import { Rating } from '../../types/profile';

// Database types
export type DbProfile = Database['public']['Tables']['profiles']['Row'];
export type DbRating = Database['public']['Tables']['ratings']['Row'];

// Extended types with relationships
export interface ProfileWithRatings extends DbProfile {
  ratings?: Array<DbRating & {
    reviewer?: {
      username: string;
    };
  }>;
}

// Transformed types
export interface TransformedProfile extends Omit<ProfileWithRatings, 'ratings'> {
  average_rating: number;
  ratings: Rating[];
}

// Validation types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}