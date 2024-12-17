```typescript
import { DbProfile } from '../../../types/supabase';
import { UserProfile } from '../../../types/profile';
import { transformRating } from './ratingTransformer';
import { calculateAverageRating } from '../utils/calculations';

interface ProfileWithRatings extends DbProfile {
  ratings?: Array<{
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    reviewer_id: string;
    reviewer?: {
      username: string;
    };
  }>;
}

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
```