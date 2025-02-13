/*
  # Fix User Deletion

  1. Changes
    - Add cascade deletion function
    - Add better error handling
    - Add detailed logging
*/

-- Function to safely delete a user with cascade and error handling
CREATE OR REPLACE FUNCTION safe_delete_user(target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_email TEXT;
BEGIN
    -- Get user email for logging
    SELECT email INTO v_email
    FROM auth.users
    WHERE id = target_user_id;

    IF v_email IS NULL THEN
        RAISE EXCEPTION 'User not found with ID: %', target_user_id;
    END IF;

    -- Begin transaction
    BEGIN
        -- Delete from profiles first (this should cascade to related data)
        DELETE FROM profiles WHERE id = target_user_id;
        
        -- Delete from auth.users
        DELETE FROM auth.users WHERE id = target_user_id;

        -- Log successful deletion
        INSERT INTO signup_errors (user_id, email, error_message)
        VALUES (target_user_id, v_email, 'User successfully deleted');

        RETURN TRUE;
    EXCEPTION WHEN OTHERS THEN
        -- Log the error
        INSERT INTO signup_errors (user_id, email, error_message, error_details)
        VALUES (
            target_user_id,
            v_email,
            'Failed to delete user: ' || SQLERRM,
            jsonb_build_object(
                'error_code', SQLSTATE,
                'error_message', SQLERRM,
                'error_detail', SQLSTATE || ' - ' || SQLERRM
            )
        );
        RAISE;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;