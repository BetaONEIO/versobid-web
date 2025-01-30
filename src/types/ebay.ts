export interface EbaySearchResponse {
  itemSummaries?: Array<{
    title: string;
    image?: {
      imageUrl: string;
    };
    price?: {
      value: string;
    };
  }>;
}

export interface EbayError {
  error: string;
  error_description: string;
}