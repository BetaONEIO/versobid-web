-- Create function to safely create a test user
CREATE OR REPLACE FUNCTION create_test_user()
RETURNS void AS $$
DECLARE
  test_user_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- First create the auth user if it doesn't exist
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role,
    email_confirmed_at,
    created_at,
    updated_at,
    last_sign_in_at
  ) VALUES (
    test_user_id,
    '00000000-0000-0000-0000-000000000000',
    'test@example.com',
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Test User","username":"testuser"}',
    'authenticated',
    'authenticated',
    now(),
    now(),
    now(),
    now()
  ) ON CONFLICT (id) DO NOTHING;

  -- Then create the profile if it doesn't exist
  INSERT INTO public.profiles (
    id,
    email,
    username,
    full_name,
    created_at,
    is_admin
  ) VALUES (
    test_user_id,
    'test@example.com',
    'testuser',
    'Test User',
    now(),
    false
  ) ON CONFLICT (id) DO NOTHING;

  -- Log success
  RAISE NOTICE 'Test user created or already exists with ID: %', test_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the function
SELECT create_test_user();

-- Drop the function after use
DROP FUNCTION create_test_user();