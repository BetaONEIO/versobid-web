-- Drop existing policies
DROP POLICY IF EXISTS "public_profiles_access" ON profiles;
DROP POLICY IF EXISTS "allow_email_checks" ON profiles;

-- Create a new policy specifically for email checks
CREATE POLICY "allow_email_existence_check"
  ON profiles
  FOR SELECT
  USING (true);

-- Ensure proper grants
GRANT SELECT ON profiles TO anon;
GRANT SELECT ON profiles TO authenticated;

-- Refresh RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;