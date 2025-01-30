-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow email existence check" ON profiles;

-- Create policy for anonymous users to check email existence
CREATE POLICY "Allow email existence check"
  ON profiles
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- Ensure proper grants
GRANT SELECT ON profiles TO anon, authenticated;