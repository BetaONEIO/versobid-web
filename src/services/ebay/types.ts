export interface EbayItemSummary {
  title: string;
  image?: {
    imageUrl: string;
  };
  price?: {
    value: string;
    currency: string;
  };
}

export interface EbaySearchResponse {
  itemSummaries?: EbayItemSummary[];
  total?: number;
  limit?: number;
  offset?: number;
}

export interface EbayError {
  error: string;
  error_description: string;
}