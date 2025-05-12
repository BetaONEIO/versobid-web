\n\n-- Remove any remaining problematic constraints\nALTER TABLE profiles \nDROP CONSTRAINT IF EXISTS profiles_email_match_auth;
\n\n-- Clean up any orphaned profiles\nSELECT cleanup_orphaned_profiles();
\n\n-- Ensure trigger exists and is properly set up\nDROP TRIGGER IF EXISTS validate_profile_email_trigger ON profiles;
\n\nCREATE TRIGGER validate_profile_email_trigger\nBEFORE INSERT OR UPDATE OF email ON profiles\nFOR EACH ROW\nEXECUTE FUNCTION validate_profile_email();
\n\n-- Create index on email for better performance\nCREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
;
