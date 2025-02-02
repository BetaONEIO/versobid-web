import { supabase } from '../../lib/supabase';
import { Notification, NotificationType } from '../../types/notification';
import { Database } from '../../types/supabase';
import {
  NotificationRow,
  NotificationInsert,
  NotificationUpdate,
} from './types';
import { NotificationError } from './errors';
import { NOTIFICATION_ERRORS } from './constants';

const validNotificationTypes: NotificationType[] = [
  'success',
  'error',
  'info',
  'warning',
  'bid_received',
  'bid_accepted',
  'bid_rejected',
  'payment_received',
  'shipping_update',
  'item_sold',
  'email_verification',
  'onboarding_reminder',
];

const isValidNotificationType = (type: string): type is NotificationType => {
  return validNotificationTypes.includes(type as NotificationType);
};

const transformNotification = (row: NotificationRow): Notification => {
  if (!isValidNotificationType(row.type)) {
    throw new NotificationError(`Invalid notification type: ${row.type}`);
  }

  return {
    id: row.id,
    type: row.type,
    message: row.message,
    read: row.read,
    user_id: row.user_id,
    created_at: row.created_at,
    data: row.data,
  };
};

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user?.id) {
      console.error('Error fetching user:', authError);
      return [];
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', authData.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      throw new NotificationError(error.message);
    }

    return (data || []).map(transformNotification);
  },

  async createNotification(
    notification: Omit<Notification, 'id' | 'created_at'>
  ): Promise<Notification> {
    if (!isValidNotificationType(notification.type)) {
      throw new NotificationError(NOTIFICATION_ERRORS.INVALID_TYPE);
    }

    const notificationData: NotificationInsert = {
      user_id: notification.user_id,
      type: notification.type,
      message: notification.message,
      read: notification.read || false, // Default to false if not provided
      data: notification.data,
    };

    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      throw new NotificationError(error.message);
    }

    if (!data) throw new NotificationError(NOTIFICATION_ERRORS.CREATION_FAILED);

    return transformNotification(data);
  },

  async markAsRead(notificationId: string): Promise<void> {
    const updateData: NotificationUpdate = { read: true };

    const { error } = await supabase
      .from('notifications')
      .update(updateData)
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      throw new NotificationError(error.message);
    }
  },

  async markAllAsRead(): Promise<void> {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user?.id) {
      console.error('Error fetching user:', authError);
      return;
    }

    const updateData: NotificationUpdate = { read: true };

    const { error } = await supabase
      .from('notifications')
      .update(updateData)
      .eq('user_id', authData.user.id);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      throw new NotificationError(error.message);
    }
  },

  async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Error deleting notification:', error);
      throw new NotificationError(error.message);
    }
  },
};
