import { Notification, NotificationType } from '../../types/notification';
import { Database } from '../../types/supabase';

export type NotificationRow = Database['public']['Tables']['notifications']['Row'];
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update'];

export interface NotificationService {
  getNotifications: () => Promise<Notification[]>;
  createNotification: (notification: Omit<Notification, 'id' | 'created_at'>) => Promise<Notification>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
}

export interface NotificationFilter {
  type?: NotificationType;
  read?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface NotificationValidationResult {
  isValid: boolean;
  errors: string[];
}