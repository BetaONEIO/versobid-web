export interface SearchResult {
  title: string;
  imageUrl?: string;
  price?: number;
}

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