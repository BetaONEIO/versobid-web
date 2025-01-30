export type NotificationType = 
  | 'success' 
  | 'error' 
  | 'info' 
  | 'warning'
  | 'bid_received'
  | 'bid_accepted'
  | 'bid_rejected'
  | 'payment_received'
  | 'shipping_update'
  | 'item_sold'
  | 'email_verification'
  | 'onboarding_reminder';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  user_id: string;
  created_at: string;
  data?: Record<string, any>;
}

export interface NotificationFilter {
  type?: NotificationType;
  read?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  types: {
    [K in NotificationType]: boolean;
  };
}