export interface SearchResult {
  title: string;
  imageUrl?: string;
  thumbnailImages?: Array<{
    imageUrl: string;
  }>;
  additionalImages?: Array<{
    imageUrl: string;
  }>;
  price?: number;
  condition?: string;
  itemLocation?: {
    country: string;
    postalCode: string;
  };
  seller?: {
    username: string;
    feedbackScore?: number;
    feedbackPercentage?: number;
  };
  itemWebUrl?: string;
  categories?: Array<{
    categoryId: string;
    categoryName: string;
  }>;
  shortDescription?: string;
  brand?: string;
}

export interface SearchResponse {
  success: boolean;
  results: SearchResult[];
  error?: string;
}