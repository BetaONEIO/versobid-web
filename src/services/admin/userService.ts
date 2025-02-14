import { supabase } from '../../lib/supabase';

export const adminUserService = {
  async getUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, email, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};