export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          username: string;
          full_name: string;
          avatar_url: string | null;
          email: string;
          bio?: string;
        };
      };
      bids: {
        Row: {
          id: string;
          created_at: string;
          item_id: string;
          bidder_id: string;
          amount: number;
          message?: string;
          shipping_option: string;
          status: 'pending' | 'accepted' | 'rejected' | 'countered';
        };
      };
      items: {
        Row: {
          id: string;
          created_at: string;
          title: string;
          description: string;
          price: number;
          seller_id: string;
          category: string;
          shipping_options: ShippingOption[];
          status: 'active' | 'sold' | 'archived';
        };
      };
      ratings: {
        Row: {
          id: string;
          rating: number;
          comment: string;
          created_at: string;
          reviewer_id: string;
        };
      };
    };
  };
}

interface ShippingOption {
  type: 'shipping' | 'pickup';
  cost?: number;
  location?: string;
}

export type Tables = Database['public']['Tables'];
export type DbProfile = Tables['profiles']['Row'];
export type DbBid = Tables['bids']['Row'];
export type DbItem = Tables['items']['Row'];
export type DbRating = Tables['ratings']['Row'];