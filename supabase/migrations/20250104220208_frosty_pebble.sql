/*
  # Fix Signup Flow

  1. Changes
    - Add detailed error logging for profile creation
    - Add function to check profile creation status
    - Add function to clean up failed signups
*/

-- Create a table to log signup errors
CREATE TABLE IF NOT EXISTS signup_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    email TEXT,
    error_message TEXT,
    error_details JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Function to log signup errors
CREATE OR REPLACE FUNCTION log_signup_error(
    p_user_id UUID,
    p_email TEXT,
    p_error_message TEXT,
    p_error_details JSONB DEFAULT NULL
) RETURNS void AS $$
BEGIN
    INSERT INTO signup_errors (user_id, email, error_message, error_details)
    VALUES (p_user_id, p_email, p_error_message, p_error_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check profile creation status
CREATE OR REPLACE FUNCTION check_profile_status(p_user_id UUID)
RETURNS TABLE (
    has_auth BOOLEAN,
    has_profile BOOLEAN,
    error_message TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXISTS(SELECT 1 FROM auth.users WHERE id = p_user_id) as has_auth,
        EXISTS(SELECT 1 FROM profiles WHERE id = p_user_id) as has_profile,
        (SELECT error_message FROM signup_errors WHERE user_id = p_user_id ORDER BY created_at DESC LIMIT 1) as error_message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up failed signups
CREATE OR REPLACE FUNCTION cleanup_failed_signup(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Delete auth user if exists
    DELETE FROM auth.users WHERE id = p_user_id;
    -- Delete profile if exists
    DELETE FROM profiles WHERE id = p_user_id;
    -- Log cleanup
    INSERT INTO signup_errors (user_id, email, error_message)
    VALUES (p_user_id, NULL, 'Cleaned up failed signup');
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;