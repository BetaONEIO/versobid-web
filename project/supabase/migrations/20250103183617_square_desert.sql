-- Remove the problematic constraint if it exists
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_email_match_auth;

-- Create a function to validate email matches
CREATE OR REPLACE FUNCTION validate_profile_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = NEW.id AND email = NEW.email
  ) THEN
    RAISE EXCEPTION 'Profile email must match auth.users email';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to validate email on insert/update
DROP TRIGGER IF EXISTS validate_profile_email_trigger ON profiles;
CREATE TRIGGER validate_profile_email_trigger
BEFORE INSERT OR UPDATE OF email ON profiles
FOR EACH ROW
EXECUTE FUNCTION validate_profile_email();

-- Run cleanup one more time
SELECT cleanup_orphaned_profiles();