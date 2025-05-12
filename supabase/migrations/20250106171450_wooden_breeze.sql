-- Drop any existing policies first\nDROP POLICY IF EXISTS "profiles_email_check_policy" ON profiles;
\nDROP POLICY IF EXISTS "Allow email existence check" ON profiles;
\n\n-- Create single comprehensive policy for public access\nCREATE POLICY "public_profiles_access"\n  ON profiles\n  FOR SELECT \n  TO anon, authenticated\n  USING (true);
\n\n-- Ensure proper grants\nGRANT USAGE ON SCHEMA public TO anon, authenticated;
\nGRANT SELECT ON profiles TO anon, authenticated;
\n\n-- Refresh RLS\nALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
\nALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
;
