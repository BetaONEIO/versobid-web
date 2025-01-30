import { supabase } from '../lib/supabase';
import { Notification, NotificationType } from '../types/notification';
import { Database } from '../types/database';

type NotificationRow = Database['public']['Tables']['notifications']['Row'];

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
      return [];
    }

    return (data || []).map(transformNotification);
  },

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
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

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', authData.user.id);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
};