-- Allow anonymous users to check for existing emails\nCREATE POLICY "Allow email existence check"\n  ON profiles\n  FOR SELECT \n  TO anon\n  USING (true);
\n\n-- Ensure proper grants\nGRANT SELECT ON profiles TO anon;
;
