-- Enhance signup error logging
ALTER TABLE signup_errors 
ADD COLUMN IF NOT EXISTS request_data JSONB,
ADD COLUMN IF NOT EXISTS stack_trace TEXT;

-- Create function to log detailed signup attempts
CREATE OR REPLACE FUNCTION log_signup_attempt(
    p_user_id UUID,
    p_email TEXT,
    p_request_data JSONB DEFAULT NULL
) RETURNS void AS $$
BEGIN
    INSERT INTO signup_errors (
        user_id,
        email,
        error_message,
        request_data,
        error_details
    ) VALUES (
        p_user_id,
        p_email,
        'Signup attempt started',
        p_request_data,
        jsonb_build_object(
            'timestamp', now(),
            'auth_exists', EXISTS(SELECT 1 FROM auth.users WHERE id = p_user_id),
            'profile_exists', EXISTS(SELECT 1 FROM profiles WHERE id = p_user_id)
        )
    );
EXCEPTION WHEN OTHERS THEN
    -- Log any errors in the logging itself
    INSERT INTO signup_errors (
        user_id,
        email,
        error_message,
        error_details
    ) VALUES (
        p_user_id,
        p_email,
        'Failed to log signup attempt: ' || SQLERRM,
        jsonb_build_object(
            'error_code', SQLSTATE,
            'error_message', SQLERRM
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update handle_profile_creation to include more details
CREATE OR REPLACE FUNCTION handle_profile_creation()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the attempt with full details
    INSERT INTO signup_errors (
        user_id,
        email,
        error_message,
        request_data,
        error_details
    ) VALUES (
        NEW.id,
        NEW.email,
        'Profile creation started',
        row_to_json(NEW)::jsonb,
        jsonb_build_object(
            'timestamp', now(),
            'auth_exists', EXISTS(SELECT 1 FROM auth.users WHERE id = NEW.id)
        )
    );

    -- Perform validations
    IF NEW.email IS NULL OR NEW.email = '' THEN
        RAISE EXCEPTION 'Email cannot be empty';
    END IF;

    IF NEW.username IS NULL OR NEW.username = '' THEN
        RAISE EXCEPTION 'Username cannot be empty';
    END IF;

    -- Check for duplicate email
    IF EXISTS (
        SELECT 1 FROM profiles
        WHERE email = NEW.email
        AND id != NEW.id
    ) THEN
        RAISE EXCEPTION 'Email already exists';
    END IF;

    -- Check for duplicate username
    IF EXISTS (
        SELECT 1 FROM profiles
        WHERE username = NEW.username
        AND id != NEW.id
    ) THEN
        RAISE EXCEPTION 'Username already exists';
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log the error with full details
    INSERT INTO signup_errors (
        user_id,
        email,
        error_message,
        request_data,
        error_details
    ) VALUES (
        NEW.id,
        NEW.email,
        'Profile creation failed: ' || SQLERRM,
        row_to_json(NEW)::jsonb,
        jsonb_build_object(
            'error_code', SQLSTATE,
            'error_message', SQLERRM,
            'stack_trace', pg_backend_pid()
        )
    );
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;