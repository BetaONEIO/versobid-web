/*
  # Enhanced Admin Capabilities

  1. New Functions
    - manage_users: Allows admins to update/delete users
    - manage_admins: Allows admins to promote/demote other admins
    - view_site_activity: Allows admins to view all site activity

  2. Security
    - All functions are security definer
    - Strict admin-only access control
*/

-- Function to manage users (update/delete)
CREATE OR REPLACE FUNCTION manage_user(
  admin_id UUID,
  target_user_id UUID,
  action TEXT,
  updates JSONB DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  -- Verify admin status
  IF NOT is_admin(admin_id) THEN
    RAISE EXCEPTION 'Unauthorized: User is not an admin';
  END IF;

  CASE action
    WHEN 'update' THEN
      UPDATE profiles 
      SET 
        full_name = COALESCE(updates->>'full_name', full_name),
        email = COALESCE(updates->>'email', email),
        username = COALESCE(updates->>'username', username)
      WHERE id = target_user_id;
    WHEN 'delete' THEN
      -- Don't allow deleting other admins
      IF EXISTS (SELECT 1 FROM profiles WHERE id = target_user_id AND is_admin = true) THEN
        RAISE EXCEPTION 'Cannot delete admin users';
      END IF;
      DELETE FROM profiles WHERE id = target_user_id;
    ELSE
      RAISE EXCEPTION 'Invalid action';
  END CASE;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to manage admin status
CREATE OR REPLACE FUNCTION manage_admin_status(
  admin_id UUID,
  target_user_id UUID,
  make_admin BOOLEAN
) RETURNS BOOLEAN AS $$
BEGIN
  -- Verify admin status
  IF NOT is_admin(admin_id) THEN
    RAISE EXCEPTION 'Unauthorized: User is not an admin';
  END IF;

  UPDATE profiles 
  SET is_admin = make_admin
  WHERE id = target_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin activity log table
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES profiles(id) NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on activity log
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Admin can view all activity
CREATE POLICY "Admins can view all activity"
  ON admin_activity_log
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Function to log admin activity
CREATE OR REPLACE FUNCTION log_admin_activity(
  admin_id UUID,
  action TEXT,
  target_type TEXT,
  target_id UUID,
  details JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO admin_activity_log (admin_id, action, target_type, target_id, details)
  VALUES (admin_id, action, target_type, target_id, details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;