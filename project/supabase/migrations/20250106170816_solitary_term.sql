-- Allow anonymous users to check for existing emails
CREATE POLICY "Allow email existence check"
  ON profiles
  FOR SELECT 
  TO anon
  USING (true);

-- Ensure proper grants
GRANT SELECT ON profiles TO anon;