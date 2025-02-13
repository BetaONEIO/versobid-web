/*
  # Fix email validation and cleanup

  1. Cleanup
    - Remove any remaining problematic constraints
    - Clean up orphaned profiles
  
  2. Validation
    - Ensure email validation trigger is properly set up
*/

-- Remove any remaining problematic constraints
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_email_match_auth;

-- Clean up any orphaned profiles
SELECT cleanup_orphaned_profiles();

-- Ensure trigger exists and is properly set up
DROP TRIGGER IF EXISTS validate_profile_email_trigger ON profiles;

CREATE TRIGGER validate_profile_email_trigger
BEFORE INSERT OR UPDATE OF email ON profiles
FOR EACH ROW
EXECUTE FUNCTION validate_profile_email();

-- Create index on email for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);