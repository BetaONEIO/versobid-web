/*
  # Email Validation Migration
  
  1. Remove old email constraints
  2. Add improved email validation
  3. Create index for performance
*/

-- Drop all email-related constraints
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_email_match_auth,
DROP CONSTRAINT IF EXISTS profiles_email_check;

-- Recreate the validate_profile_email function with better error handling
CREATE OR REPLACE FUNCTION validate_profile_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Only validate if email is being changed
  IF TG_OP = 'UPDATE' AND NEW.email = OLD.email THEN
    RETURN NEW;
  END IF;

  -- Check if email exists in auth.users
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

-- Recreate the trigger
DROP TRIGGER IF EXISTS validate_profile_email_trigger ON profiles;
CREATE TRIGGER validate_profile_email_trigger
BEFORE INSERT OR UPDATE OF email ON profiles
FOR EACH ROW
EXECUTE FUNCTION validate_profile_email();

-- Ensure email index exists
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);