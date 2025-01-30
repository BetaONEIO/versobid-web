import { Notification } from '../../../types/notification';
import { CreateNotificationParams } from './notification';
import { NotificationFilter, NotificationFilterOptions } from './filter';

export interface NotificationService {
  getNotifications: (filter?: NotificationFilter, options?: NotificationFilterOptions) => Promise<Notification[]>;
  createNotification: (params: CreateNotificationParams) => Promise<Notification>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  getUnreadCount: (userId: string) => Promise<number>;
  subscribeToNotifications: (userId: string, callback: (notification: Notification) => void) => () => void;
}

export interface NotificationServiceConfig {
  maxRetries: number;
  retryDelay: number;
  batchSize: number;
  defaultFilter: NotificationFilter;
  defaultFilterOptions: NotificationFilterOptions;
}

export interface NotificationServiceDependencies {
  supabase: any; // Replace with proper Supabase client type
  logger?: NotificationLogger;
}

export interface NotificationLogger {
  info: (message: string, data?: any) => void;
  error: (message: string, error?: any) => void;
  warn: (message: string, data?: any) => void;
}