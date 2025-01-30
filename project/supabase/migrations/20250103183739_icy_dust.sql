/*
  # Fix validation constraints

  1. Remove complex validations
  2. Add simple unique constraints
  3. Add basic triggers for validation
*/

-- Remove any existing complex constraints
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_email_match_auth,
DROP CONSTRAINT IF EXISTS profiles_email_check,
DROP CONSTRAINT IF EXISTS profiles_email_unique;

-- Add simple unique constraint
ALTER TABLE profiles
ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- Create simple validation function
CREATE OR REPLACE FUNCTION validate_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Basic validation
  IF NEW.email IS NULL OR NEW.email = '' THEN
    RAISE EXCEPTION 'Email cannot be empty';
  END IF;
  
  IF NEW.username IS NULL OR NEW.username = '' THEN
    RAISE EXCEPTION 'Username cannot be empty';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for validation
DROP TRIGGER IF EXISTS validate_profile_trigger ON profiles;
CREATE TRIGGER validate_profile_trigger
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION validate_profile();

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);