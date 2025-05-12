-- Drop existing policy if it exists\nDROP POLICY IF EXISTS "Allow email existence check" ON profiles;
\n\n-- Create policy for anonymous users to check email existence\nCREATE POLICY "Allow email existence check"\n  ON profiles\n  FOR SELECT \n  TO anon, authenticated\n  USING (true);
\n\n-- Ensure proper grants\nGRANT SELECT ON profiles TO anon, authenticated;
;
