import { supabase } from '../../lib/supabase';
import { Notification, NotificationType } from '../../types/notification';
import { Database } from '../../types/supabase';

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
  data: row.data
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
      return [];
    }

    return (data || []).map(row => transformNotification(row as NotificationRow));
  },

  async createNotification(
    notification: Omit<Notification, 'id' | 'created_at'>
  ): Promise<Notification | null> {
    try {
      const notificationData: NotificationInsert = {
        user_id: notification.user_id,
        type: notification.type,
        message: notification.message,
        read: notification.read || false,
        data: notification.data
      };

      const { data, error } = await supabase
        .from('notifications')
        .insert([notificationData])
        .select()
        .single();

      if (error) throw error;
      if (!data) return null;

      return transformNotification(data as NotificationRow);
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  },

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const updateData: NotificationUpdate = { read: true };

      const { error } = await supabase
        .from('notifications')
        .update(updateData)
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  async markAllAsRead(): Promise<void> {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user?.id) {
      console.error('Error fetching user:', authError);
      return;
    }

    try {
      const updateData: NotificationUpdate = { read: true };

      const { error } = await supabase
        .from('notifications')
        .update(updateData)
        .eq('user_id', authData.user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
};