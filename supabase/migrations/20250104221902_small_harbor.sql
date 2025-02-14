/*
  # Add Profile Error Handling
  
  1. Creates error handling function for profile creation
  2. Sets up trigger for logging profile creation attempts
  3. Grants necessary permissions
*/

-- Create better error handling function
CREATE OR REPLACE FUNCTION handle_profile_creation()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    -- Basic validation
    IF NEW.email IS NULL OR NEW.email = '' THEN
      RAISE EXCEPTION 'Email cannot be empty';
    END IF;

    IF NEW.username IS NULL OR NEW.username = '' THEN
      RAISE EXCEPTION 'Username cannot be empty';
    END IF;

    -- Log attempt
    INSERT INTO signup_errors (user_id, email, error_message)
    VALUES (NEW.id, NEW.email, 'Profile creation attempted');

    RETURN NEW;
  EXCEPTION WHEN OTHERS THEN
    -- Log error
    INSERT INTO signup_errors (
      user_id,
      email,
      error_message,
      error_details
    ) VALUES (
      NEW.id,
      NEW.email,
      'Profile creation failed: ' || SQLERRM,
      jsonb_build_object(
        'error_code', SQLSTATE,
        'error_message', SQLERRM
      )
    );
    RAISE;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for error handling
DROP TRIGGER IF EXISTS handle_profile_creation_trigger ON profiles;
CREATE TRIGGER handle_profile_creation_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_profile_creation();

-- Grant necessary permissions
GRANT ALL ON signup_errors TO authenticated;
GRANT ALL ON signup_errors TO service_role;