-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create function to safely create profile
CREATE OR REPLACE FUNCTION create_profile_safely(
  user_id UUID,
  user_email TEXT,
  user_username TEXT,
  user_full_name TEXT
) RETURNS boolean AS $$
DECLARE
  final_username TEXT;
  attempt_count INTEGER := 0;
  MAX_ATTEMPTS CONSTANT INTEGER := 3;
BEGIN
  -- Initialize username
  final_username := user_username;
  
  LOOP
    EXIT WHEN attempt_count >= MAX_ATTEMPTS;
    BEGIN
      INSERT INTO public.profiles (
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
        user_id,
        user_email,
        final_username,
        user_full_name,
        NOW(),
        false,
        null,
        null,
        false,
        false
      );
      
      -- If we get here, insert was successful
      RETURN true;
      
    EXCEPTION 
      WHEN unique_violation THEN
        -- Only retry for username violations
        IF attempt_count < MAX_ATTEMPTS THEN
          final_username := user_username || '_' || floor(random() * 9000 + 1000)::text;
          attempt_count := attempt_count + 1;
          CONTINUE;
        END IF;
      WHEN OTHERS THEN
        -- Log other errors
        PERFORM log_auth_error(
          user_id,
          user_email,
          SQLERRM,
          jsonb_build_object(
            'state', SQLSTATE,
            'attempt', attempt_count,
            'username', final_username
          )
        );
        RETURN false;
    END;
  END LOOP;
  
  -- If we get here, all attempts failed
  PERFORM log_auth_error(
    user_id,
    user_email,
    'Failed to create profile after maximum attempts',
    jsonb_build_object(
      'max_attempts', MAX_ATTEMPTS,
      'final_username', final_username
    )
  );
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create improved user creation handler
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  username text;
  full_name text;
  success boolean;
BEGIN
  -- Extract user data
  username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-zA-Z0-9_]', '_', 'g')
  );
  
  full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    username
  );

  -- Attempt to create profile
  success := create_profile_safely(
    NEW.id,
    NEW.email,
    username,
    full_name
  );

  IF NOT success THEN
    RAISE WARNING 'Failed to create profile for user: %', NEW.email;
  END IF;

  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies safely
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "profiles_select" ON profiles;
    DROP POLICY IF EXISTS "profiles_insert" ON profiles;
    DROP POLICY IF EXISTS "profiles_update" ON profiles;
EXCEPTION 
    WHEN undefined_object THEN NULL;
END $$;

-- Create simplified policies
CREATE POLICY "profiles_select"
  ON profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "profiles_insert"
  ON profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "profiles_update"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ensure proper grants
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON profiles TO service_role;
GRANT SELECT ON profiles TO anon;
GRANT SELECT, UPDATE ON profiles TO authenticated;

-- Create unique indexes
DROP INDEX IF EXISTS idx_profiles_email;
DROP INDEX IF EXISTS idx_profiles_username;
CREATE UNIQUE INDEX idx_profiles_email ON profiles(email);
CREATE UNIQUE INDEX idx_profiles_username ON profiles(username);

-- Create error logging table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  email TEXT,
  error TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create or replace error logging function
CREATE OR REPLACE FUNCTION log_auth_error(
  p_user_id UUID,
  p_email TEXT,
  p_error TEXT,
  p_details JSONB DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO auth_errors (user_id, email, error, details)
  VALUES (p_user_id, p_email, p_error, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;