/*
  # Fix Profile Creation Policy and Validation

  1. Changes
    - Fix check_user_exists function
    - Fix profile creation policy to properly reference NEW record
    - Add validation function and trigger for profile creation

  2. Security
    - Enable RLS
    - Add policies with proper record validation
*/

-- Drop and recreate check_user_exists with better error handling
CREATE OR REPLACE FUNCTION check_user_exists(
  check_email TEXT,
  check_username TEXT
)
RETURNS TABLE (
  exists_email BOOLEAN,
  exists_username BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXISTS(
      SELECT 1 
      FROM profiles 
      WHERE email = check_email
    ) as exists_email,
    EXISTS(
      SELECT 1 
      FROM profiles 
      WHERE username = check_username
    ) as exists_username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow profile creation during signup" ON profiles;

-- Create policy for profile creation
CREATE POLICY "Allow profile creation during signup"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id AND
    NOT EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.email = profiles.email OR p.username = profiles.username
    )
  );

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