import { supabase } from '../lib/supabase';
import { User } from '../types/user';
import { Database } from '../types/supabase';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export const adminService = {
  async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return [];
      
      return (data || []).map((profile: ProfileRow): User => ({
        id: profile.id,
        name: profile.full_name || '',
        email: profile.email || '',
        username: profile.username || '',
        is_admin: profile.is_admin || false,
        email_verified: false
      }));
    } catch {
      return [];
    }
  },

  async deleteUser(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .rpc('manage_user', {
          admin_id: (await supabase.auth.getUser()).data.user?.id,
          target_user_id: userId,
          action: 'delete'
        });

      return !error;
    } catch {
      return false;
    }
  },

  async setAdminStatus(userId: string, isAdmin: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .rpc('manage_admin_status', {
          admin_id: (await supabase.auth.getUser()).data.user?.id,
          target_user_id: userId,
          make_admin: isAdmin
        });

      return !error;
    } catch {
      return false;
    }
  },

  async getActivityLog(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('admin_activity_log')
        .select(`
          *,
          admin:profiles!admin_id(username)
        `)
        .order('created_at', { ascending: false });

      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  }
};