import { supabase } from '../../lib/supabase';
import { Notification, NotificationType } from '../../types/notification';
import { Database } from '../../types/database';
import { NotificationError } from './errors';
import { NOTIFICATION_ERRORS } from './constants';
import { validateNotification } from './validators';
import { CreateNotificationParams } from './types';

type NotificationRow = Database['public']['Tables']['notifications']['Row'];
type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
type NotificationUpdate = Database['public']['Tables']['notifications']['Update'];

const transformNotification = (row: NotificationRow): Notification => ({
  id: row.id,
  type: row.type as NotificationType,
  message: row.message,
  read: row.read,
  user_id: row.user_id,
  created_at: row.created_at,
  data: row.data || undefined
});

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

  async createNotification(params: CreateNotificationParams): Promise<Notification> {
    const errors = validateNotification(params);
    if (errors.length > 0) {
      throw new NotificationError(errors.join(', '));
    }

    const notificationData: NotificationInsert = {
      user_id: params.user_id,
      type: params.type,
      message: params.message,
      read: false,
      data: params.data || null
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
  }
};