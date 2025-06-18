export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          email: string | null;
          rating:number | null;
          is_admin: boolean | false;
          shipping_address?: {
            street: string | null;
            city: string | null;
            postcode: string | null;
            country: string | null;
          } | null;
          payment_setup?: boolean | false;
          onboarding_completed?: boolean | false;
          paypal_email?: string | null;
          paypal_merchant_id?: string | null;
          paypal_sandbox_email?: string | null;
          paypal_sandbox_merchant_id?: string | null;
        };
        Insert: {
          id: string;
          created_at: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          email: string | null;
          rating:number | null;
          is_admin: boolean | false;
          shipping_address?: {
            street: string | null;
            city: string | null;
            postcode: string | null;
            country: string | null;
          } | null;
          payment_setup?: boolean | false;
          onboarding_completed?: boolean | false;
          paypal_email?: string | null;
          paypal_merchant_id?: string | null;
          paypal_sandbox_email?: string | null;
          paypal_sandbox_merchant_id?: string | null;
        };
        Update: {
          full_name: string;
          email: string;
          username: string;         
          avatar_url: string | null;
          rating:number | null;
          is_admin: boolean | false;
          shipping_address?: {
            street: string | null;
            city: string | null;
            postcode: string | null;
            country: string | null;
          } | null;
          payment_setup?: boolean | false;
          onboarding_completed?: boolean | false;
          paypal_email?: string | null;
          paypal_merchant_id?: string | null;
          paypal_sandbox_email?: string | null;
          paypal_sandbox_merchant_id?: string | null;
        };
      };
      items: {
        Row: {
          id: string;
          title: string;
          description: string;
          min_price: number;
          max_price: number;
          seller_id?: string;
          category: string;
          shipping_options: any[];
          status: 'active' | 'completed' | 'archived';
          created_at: string;
          image_url?: string;
          buyer_id: string ;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          min_price: number;
          max_price: number;
          seller_id?: string;
          category: string;
          shipping_options?: any[];
          status?: 'active' | 'completed' | 'archived';
          created_at?: string;
          image_url?: string;
          buyer_id: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          min_price?: number;
          max_price?: number;
          seller_id?: string;
          category?: string;
          shipping_options?: any[];
          status?: 'active' | 'completed' | 'archived';
          created_at?: string;
          image_url?: string;
          buyer_id?: string ;
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
          status?: 'pending' | 'accepted' | 'rejected' | 'countered' | 'confirmed';
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
          data: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          message: string;
          read?: boolean;
          data?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          message?: string;
          read?: boolean;
          data?: any;
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