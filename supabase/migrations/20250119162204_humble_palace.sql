-- Drop existing policies first
DROP POLICY IF EXISTS "profiles_select_policy_v5" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy_v5" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy_v5" ON profiles;

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create new policies with proper permissions
CREATE POLICY "profiles_select_v6"
  ON profiles
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "profiles_insert_v6"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_v6"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create function to validate profile creation
CREATE OR REPLACE FUNCTION validate_profile_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if email already exists
  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE email = NEW.email
    AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'Email already exists';
  END IF;

  -- Check if username already exists
  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE username = NEW.username
    AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'Username already exists';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profile validation
DROP TRIGGER IF EXISTS validate_profile_creation_trigger ON profiles;
CREATE TRIGGER validate_profile_creation_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_profile_creation();

-- Ensure proper grants
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);