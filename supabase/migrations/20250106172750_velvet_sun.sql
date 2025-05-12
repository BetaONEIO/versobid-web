-- Drop existing policies\nDROP POLICY IF EXISTS "public_profiles_access" ON profiles;
\nDROP POLICY IF EXISTS "allow_email_checks" ON profiles;
\n\n-- Create a new policy specifically for email checks\nCREATE POLICY "allow_email_existence_check"\n  ON profiles\n  FOR SELECT\n  USING (true);
\n\n-- Ensure proper grants\nGRANT SELECT ON profiles TO anon;
\nGRANT SELECT ON profiles TO authenticated;
\n\n-- Refresh RLS\nALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
\nALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
;
