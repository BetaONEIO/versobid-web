/*
  # Email Validation Migration
  
  1. Basic email validation function
  2. Simple trigger setup
  3. Email index for performance
*/

-- Create simplified email validation function
CREATE OR REPLACE FUNCTION validate_profile_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Basic validation
  IF NEW.email IS NULL OR NEW.email = '' THEN
    RAISE EXCEPTION 'Email cannot be empty';
  END IF;

  -- Check for duplicates
  IF EXISTS (
    SELECT 1 FROM profiles 
    WHERE email = NEW.email 
    AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'Email already exists';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set up basic trigger
DROP TRIGGER IF EXISTS validate_profile_email_trigger ON profiles;
CREATE TRIGGER validate_profile_email_trigger
BEFORE INSERT OR UPDATE OF email ON profiles
FOR EACH ROW
EXECUTE FUNCTION validate_profile_email();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);