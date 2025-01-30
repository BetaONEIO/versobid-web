import { Database } from '../../../types/supabase';
import { NotificationType } from '../../../types/notification';

export type NotificationRow = Database['public']['Tables']['notifications']['Row'];
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update'];

export interface CreateNotificationParams {
  user_id: string;
  type: NotificationType;
  message: string;
  data?: Record<string, any>;
}

export interface NotificationError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface NotificationConfig {
  maxRetries: number;
  retryDelay: number;
  batchSize: number;
}

export interface NotificationTemplate {
  type: NotificationType;
  message: string;
  data?: Record<string, any>;
}