-- Clean up orphaned profiles
CREATE OR REPLACE FUNCTION cleanup_orphaned_profiles()
RETURNS void AS $$
BEGIN
  -- Delete profiles that don't have corresponding auth.users entries
  DELETE FROM profiles
  WHERE id NOT IN (
    SELECT id FROM auth.users
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the cleanup
SELECT cleanup_orphaned_profiles();

-- Create trigger to automatically clean up orphaned profiles
CREATE OR REPLACE FUNCTION cleanup_profile_on_user_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM profiles WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER cleanup_profile_trigger
  AFTER DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_profile_on_user_delete();