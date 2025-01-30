-- Drop any existing policies first
DROP POLICY IF EXISTS "profiles_email_check_policy" ON profiles;
DROP POLICY IF EXISTS "Allow email existence check" ON profiles;
DROP POLICY IF EXISTS "allow_email_checks" ON profiles;

-- Create single unified policy for email checks (only if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'allow_email_checks'
  ) THEN
    CREATE POLICY "allow_email_checks"
      ON profiles
      FOR SELECT 
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

-- Ensure proper grants
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON profiles TO anon, authenticated;

-- Refresh RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;