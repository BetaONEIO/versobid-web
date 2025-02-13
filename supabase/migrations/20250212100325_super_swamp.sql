-- Grant necessary permissions to the auth user
ALTER USER authenticator SET search_path = public;

-- Ensure the auth user has proper permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Ensure RLS is enabled on all tables
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS auth_errors ENABLE ROW LEVEL SECURITY;

-- Drop and recreate the handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  username text;
  full_name text;
BEGIN
  -- Extract or generate username
  username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-zA-Z0-9_]', '_', 'g')
  );
  
  -- Extract or use username as full name
  full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    username
  );

  -- Ensure username is unique
  IF EXISTS (SELECT 1 FROM profiles WHERE username = username) THEN
    username := username || '_' || substring(md5(random()::text), 1, 6);
  END IF;

  -- Create profile
  INSERT INTO profiles (
    id,
    email,
    username,
    full_name,
    created_at,
    is_admin,
    avatar_url,
    shipping_address,
    payment_setup,
    onboarding_completed
  ) VALUES (
    NEW.id,
    NEW.email,
    username,
    full_name,
    NOW(),
    false,
    null,
    null,
    false,
    false
  );

  RETURN NEW;
EXCEPTION WHEN others THEN
  -- Log error but don't prevent user creation
  INSERT INTO auth_errors (
    user_id,
    email,
    error,
    details
  ) VALUES (
    NEW.id,
    NEW.email,
    SQLERRM,
    jsonb_build_object(
      'state', SQLSTATE,
      'username', username,
      'full_name', full_name
    )
  );
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create policy for auth errors table
CREATE POLICY "auth_errors_admin_only"
  ON auth_errors
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Ensure proper grants for auth_errors table
GRANT ALL ON auth_errors TO service_role;
GRANT SELECT ON auth_errors TO authenticated;