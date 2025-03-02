export interface EbaySearchResponse {
  itemSummaries?: Array<{
    title: string;
    image?: {
      imageUrl: string;
    };
    price?: {
      value: string;
      currency: string;
    };
    condition?: string;
    itemLocation?: {
      country: string;
      postalCode?: string;
    };
    seller?: {
      username: string;
      feedbackScore?: number;
    };
    shortDescription?: string;
  }>;
  total?: number;
  limit?: number;
  offset?: number;
}

export interface EbayError {
  error: string;
  error_description: string;
}