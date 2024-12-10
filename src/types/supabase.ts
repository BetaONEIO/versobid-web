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
        };
      };
      bids: {
        Row: {
          id: string;
          created_at: string;
          item_id: string;
          bidder_id: string;
          amount: number;
          status: 'pending' | 'accepted' | 'rejected';
        };
        Insert: {
          id?: string;
          created_at?: string;
          item_id: string;
          bidder_id: string;
          amount: number;
          status?: 'pending' | 'accepted' | 'rejected';
        };
        Update: {
          id?: string;
          created_at?: string;
          item_id?: string;
          bidder_id?: string;
          amount?: number;
          status?: 'pending' | 'accepted' | 'rejected';
        };
      };
      chats: {
        Row: {
          id: string;
          created_at: string;
          item_id: string;
          buyer_id: string;
          seller_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          item_id: string;
          buyer_id: string;
          seller_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          item_id?: string;
          buyer_id?: string;
          seller_id?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          created_at: string;
          chat_id: string;
          sender_id: string;
          content: string;
          read: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          chat_id: string;
          sender_id: string;
          content: string;
          read?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          chat_id?: string;
          sender_id?: string;
          content?: string;
          read?: boolean;
        };
      };
    };
  };
}