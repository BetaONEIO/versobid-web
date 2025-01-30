-- Drop all existing policies first
DROP POLICY IF EXISTS "allow_email_existence_check" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "public_profiles_access" ON profiles;
DROP POLICY IF EXISTS "allow_email_checks" ON profiles;
DROP POLICY IF EXISTS "profiles_public_read" ON profiles;

-- Create new policies with unique version numbers
CREATE POLICY "profiles_select_v3"
  ON profiles
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "profiles_insert_v3"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_v3"
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