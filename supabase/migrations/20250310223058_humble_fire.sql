\n\nDO $$ \nDECLARE\n  test_user_id uuid := '00000000-0000-0000-0000-000000000001';
\n  existing_user_id uuid;
\nBEGIN\n  -- Check for existing user by email\n  SELECT id INTO existing_user_id \n  FROM auth.users \n  WHERE email = 'test@example.com';
\n\n  -- If user exists, use that ID instead\n  IF existing_user_id IS NOT NULL THEN\n    test_user_id := existing_user_id;
\n  ELSE\n    -- Create new user only if email doesn't exist\n    INSERT INTO auth.users (\n      id,\n      email,\n      encrypted_password,\n      email_confirmed_at,\n      created_at,\n      updated_at\n    ) VALUES (\n      test_user_id,\n      'test@example.com',\n      crypt('Hellworld1!', gen_salt('bf')),\n      now(),\n      now(),\n      now()\n    );
\n  END IF;
\n\n  -- Create or update profile\n  INSERT INTO public.profiles (\n    id,\n    email,\n    username,\n    full_name,\n    email_verified,\n    is_admin,\n    created_at\n  ) VALUES (\n    test_user_id,\n    'test@example.com',\n    'testuser',\n    'Test User',\n    true,\n    false,\n    now()\n  ) ON CONFLICT (id) DO UPDATE SET\n    email = EXCLUDED.email,\n    username = EXCLUDED.username,\n    full_name = EXCLUDED.full_name,\n    email_verified = EXCLUDED.email_verified;
\n\nEND $$;
;
