import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { adminService } from '../services/adminService';
import { UserManagement } from '../components/admin/UserManagement';
import { ActivityLog } from '../components/admin/ActivityLog';
import { EnvVarsTest } from '../components/test/EnvVarsTest';
import { User } from '../types/user';
import { Database } from '../types/supabase';
import { supabase } from '../lib/supabase';

interface AdminActivity {
  id: string;
  action: string;
  target_type: string;
  details: Record<string, any>;
  created_at: string;
  admin: {
    username: string;
  };
}

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export const Admin: React.FC = () => {
  const { auth } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        if (!auth.user?.id) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', auth.user.id)
          .maybeSingle<ProfileRow>();

        if (profile?.is_admin) {
          setIsAdmin(true);
          const [usersData, activitiesData] = await Promise.all([
            adminService.getAllUsers(),
            adminService.getActivityLog(),
          ]);

          setUsers(usersData);
          setActivities(activitiesData);
        }
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [auth.user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="space-y-8">
        <section>
          <EnvVarsTest />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <UserManagement users={users} />
        </section>

        <section>
          <ActivityLog activities={activities} />
        </section>
      </div>
    </div>
  );
};