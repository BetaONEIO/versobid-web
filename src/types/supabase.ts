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
        };
        Insert: {
          id: string;
          created_at?: string;
          username: string;
          full_name: string;
          avatar_url?: string | null;
          email: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          username?: string;
          full_name?: string;
          avatar_url?: string | null;
          email?: string;
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
          status: 'active' | 'sold' | 'archived';
          category: string;
          shipping_options: {
            type: 'shipping' | 'pickup';
            cost?: number;
            location?: string;
          }[];
        };
        Insert: {
          id?: string;
          created_at?: string;
          title: string;
          description: string;
          price: number;
          seller_id: string;
          status?: 'active' | 'sold' | 'archived';
          category: string;
          shipping_options: {
            type: 'shipping' | 'pickup';
            cost?: number;
            location?: string;
          }[];
        };
        Update: {
          id?: string;
          created_at?: string;
          title?: string;
          description?: string;
          price?: number;
          seller_id?: string;
          status?: 'active' | 'sold' | 'archived';
          category?: string;
          shipping_options?: {
            type: 'shipping' | 'pickup';
            cost?: number;
            location?: string;
          }[];
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
        Insert: {
          id?: string;
          created_at?: string;
          item_id: string;
          bidder_id: string;
          amount: number;
          message?: string;
          shipping_option: string;
          status?: 'pending' | 'accepted' | 'rejected' | 'countered';
        };
        Update: {
          id?: string;
          created_at?: string;
          item_id?: string;
          bidder_id?: string;
          amount?: number;
          message?: string;
          shipping_option?: string;
          status?: 'pending' | 'accepted' | 'rejected' | 'countered';
        };
      };
    };
  };
}