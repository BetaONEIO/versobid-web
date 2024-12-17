export interface Rating {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer_id: string;
  reviewer?: {
    username: string;
  };
  reviewer_name?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  bio?: string;
  created_at: string;
  ratings?: Rating[];
  average_rating?: number;
}