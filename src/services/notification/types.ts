import { Notification, NotificationType } from '../../types/notification';

export interface CreateNotificationParams {
  user_id: string;
  type: NotificationType;
  message: string;
  data?: Record<string, any>;
}

export interface NotificationService {
  getNotifications: () => Promise<Notification[]>;
  createNotification: (params: CreateNotificationParams) => Promise<Notification>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}