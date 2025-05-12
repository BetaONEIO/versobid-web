-- Create function to safely create a test user\nCREATE OR REPLACE FUNCTION create_test_user()\nRETURNS void AS $$\nDECLARE\n  test_user_id UUID := '00000000-0000-0000-0000-000000000001';
\nBEGIN\n  -- First create the auth user if it doesn't exist\n  INSERT INTO auth.users (\n    id,\n    instance_id,\n    email,\n    encrypted_password,\n    email_confirmed_at,\n    raw_app_meta_data,\n    raw_user_meta_data,\n    aud,\n    role,\n    created_at,\n    updated_at\n  ) VALUES (\n    test_user_id,\n    '00000000-0000-0000-0000-000000000000',\n    'test@example.com',\n    crypt('Test123!', gen_salt('bf')),\n    now(),\n    '{"provider":"email","providers":["email"]}',\n    '{"full_name":"Test User","username":"testuser"}',\n    'authenticated',\n    'authenticated',\n    now(),\n    now()\n  ) ON CONFLICT (id) DO NOTHING;
\n\n  -- Then create the profile if it doesn't exist\n  INSERT INTO public.profiles (\n    id,\n    email,\n    username,\n    full_name,\n    created_at,\n    is_admin\n  ) VALUES (\n    test_user_id,\n    'test@example.com',\n    'testuser',\n    'Test User',\n    now(),\n    false\n  ) ON CONFLICT (id) DO NOTHING;
\n\n  -- Log success\n  RAISE NOTICE 'Test user created or already exists with ID: %', test_user_id;
\nEND;
\n$$ LANGUAGE plpgsql SECURITY DEFINER;
\n\n-- Execute the function\nSELECT create_test_user();
\n\n-- Drop the function after use\nDROP FUNCTION create_test_user();
;
