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
          is_admin: boolean;
          shipping_address?: {
            street: string;
            city: string;
            postcode: string;
            country: string;
          } | null;
          payment_setup?: boolean;
          onboarding_completed?: boolean;
          rating?: number;
        };
        Insert: {
          id: string;
          created_at?: string;
          username: string;
          full_name: string;
          avatar_url?: string | null;
          email: string;
          is_admin?: boolean;
          shipping_address?: {
            street: string;
            city: string;
            postcode: string;
            country: string;
          } | null;
          payment_setup?: boolean;
          onboarding_completed?: boolean;
          rating?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          username?: string;
          full_name?: string;
          avatar_url?: string | null;
          email?: string;
          is_admin?: boolean;
          shipping_address?: {
            street: string;
            city: string;
            postcode: string;
            country: string;
          } | null;
          payment_setup?: boolean;
          onboarding_completed?: boolean;
          rating?: number;
        };
      };
      items: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          min_price: number;
          max_price: number;
          seller_id: string;
          category: string;
          shipping_options: any[];
          status: 'active' | 'completed' | 'archived';
          created_at: string;
          image_url?: string | null;
          archived_reason?: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          min_price: number;
          max_price: number;
          seller_id: string;
          category: string;
          shipping_options?: any[];
          status?: 'active' | 'completed' | 'archived';
          created_at?: string;
          image_url?: string | null;
          archived_reason?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          min_price?: number;
          max_price?: number;
          seller_id?: string;
          category?: string;
          shipping_options?: any[];
          status?: 'active' | 'completed' | 'archived';
          created_at?: string;
          image_url?: string | null;
          archived_reason?: string | null;
        };
      };
      bids: {
        Row: {
          id: string;
          item_id: string;
          bidder_id: string;
          amount: number;
          message: string | null;
          status: 'pending' | 'accepted' | 'rejected' | 'countered';
          created_at: string;
          counter_amount?: number | null;
        };
        Insert: {
          id?: string;
          item_id: string;
          bidder_id: string;
          amount: number;
          message?: string | null;
          status?: 'pending' | 'accepted' | 'rejected' | 'countered';
          created_at?: string;
          counter_amount?: number | null;
        };
        Update: {
          id?: string;
          item_id?: string;
          bidder_id?: string;
          amount?: number;
          message?: string | null;
          status?: 'pending' | 'accepted' | 'rejected' | 'countered';
          created_at?: string;
          counter_amount?: number | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          message: string;
          read: boolean;
          data: Record<string, any> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          message: string;
          read?: boolean;
          data?: Record<string, any> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          message?: string;
          read?: boolean;
          data?: Record<string, any> | null;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          amount: number;
          currency: string;
          item_id: string;
          buyer_id: string;
          seller_id: string;
          transaction_id: string;
          status: string;
          provider: string;
          shipping_deadline: string | null;
          shipping_confirmed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          amount: number;
          currency: string;
          item_id: string;
          buyer_id: string;
          seller_id: string;
          transaction_id: string;
          status?: string;
          provider: string;
          shipping_deadline?: string | null;
          shipping_confirmed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          amount?: number;
          currency?: string;
          item_id?: string;
          buyer_id?: string;
          seller_id?: string;
          transaction_id?: string;
          status?: string;
          provider?: string;
          shipping_deadline?: string | null;
          shipping_confirmed?: boolean;
          created_at?: string;
        };
      };
      email_logs: {
        Row: {
          id: string;
          recipient: string;
          subject: string;
          template_name: string;
          status: 'pending' | 'sent' | 'failed';
          error: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          recipient: string;
          subject: string;
          template_name: string;
          status?: 'pending' | 'sent' | 'failed';
          error?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          recipient?: string;
          subject?: string;
          template_name?: string;
          status?: 'pending' | 'sent' | 'failed';
          error?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}