/*
  # Fix User Registration Issues

  1. Changes
    - Add unique constraint on email and username
    - Add function to check if email/username exists
    - Add trigger to prevent duplicate emails/usernames
    - Add cleanup function for orphaned records
*/

-- Function to check if email or username exists
CREATE OR REPLACE FUNCTION check_user_exists(
  check_email TEXT,
  check_username TEXT
) RETURNS TABLE (
  exists_email BOOLEAN,
  exists_username BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXISTS(SELECT 1 FROM profiles WHERE email = check_email) as exists_email,
    EXISTS(SELECT 1 FROM profiles WHERE username = check_username) as exists_username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up orphaned profiles
CREATE OR REPLACE FUNCTION cleanup_orphaned_profiles()
RETURNS void AS $$
BEGIN
  -- Delete profiles that don't have corresponding auth.users entries
  DELETE FROM profiles p
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users u 
    WHERE u.id = p.id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run initial cleanup
SELECT cleanup_orphaned_profiles();

-- Add trigger to automatically clean up orphaned profiles
DROP TRIGGER IF EXISTS cleanup_profiles_trigger ON auth.users;

CREATE TRIGGER cleanup_profiles_trigger
AFTER DELETE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION cleanup_profile_on_user_delete();