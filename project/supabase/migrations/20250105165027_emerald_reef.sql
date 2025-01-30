/*
  # Enhance Admin Access Controls

  1. Changes
    - Add explicit admin access policy
    - Add admin check function
    - Add admin-only table access

  2. Security
    - Enable admin-specific RLS policies
    - Add function to verify admin status
*/

-- Create or replace the admin check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add admin policy to profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (is_admin());

-- Add admin policy to items
CREATE POLICY "Admins can manage all items"
  ON items
  FOR ALL
  TO authenticated
  USING (is_admin());