-- Drop existing policies by name
DROP POLICY IF EXISTS "profiles_select_policy_v4" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy_v4" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy_v4" ON profiles;
DROP POLICY IF EXISTS "profiles_select_v3" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_v3" ON profiles;
DROP POLICY IF EXISTS "profiles_update_v3" ON profiles;
DROP POLICY IF EXISTS "allow_email_existence_check" ON profiles;
DROP POLICY IF EXISTS "public_profiles_access" ON profiles;

-- Create new policies with unique names
CREATE POLICY "profiles_select_policy_v5"
  ON profiles
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "profiles_insert_policy_v5"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy_v5"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ensure proper grants
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;

-- Refresh RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;