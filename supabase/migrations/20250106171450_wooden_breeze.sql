-- Drop any existing policies first
DROP POLICY IF EXISTS "profiles_email_check_policy" ON profiles;
DROP POLICY IF EXISTS "Allow email existence check" ON profiles;

-- Create single comprehensive policy for public access
CREATE POLICY "public_profiles_access"
  ON profiles
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- Ensure proper grants
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON profiles TO anon, authenticated;

-- Refresh RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;