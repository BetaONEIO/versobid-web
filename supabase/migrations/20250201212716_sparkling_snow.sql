-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create improved function to handle new user creation with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  username text;
  full_name text;
  retry_count integer := 0;
  max_retries constant integer := 3;
BEGIN
  -- Extract username and full_name from metadata with better defaults
  username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-zA-Z0-9_]', '_', 'g')
  );
  
  full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    username
  );

  -- Insert profile with retry logic
  WHILE retry_count < max_retries LOOP
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
      
      -- If successful, exit the loop
      EXIT;
      
    EXCEPTION 
      WHEN unique_violation THEN
        -- Only handle username conflicts
        IF retry_count < max_retries THEN
          username := username || '_' || (floor(random() * 9000 + 1000))::text;
          retry_count := retry_count + 1;
          CONTINUE;
        ELSE
          RAISE EXCEPTION 'Failed to create unique username after % attempts', max_retries;
        END IF;
      WHEN OTHERS THEN
        -- Log other errors and re-raise
        RAISE WARNING 'Error creating profile for user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
        RAISE;
    END;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Recreate trigger with AFTER INSERT to ensure auth user exists
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "profiles_read_policy" ON profiles;
    DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
    DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
    DROP POLICY IF EXISTS "allow_read_all_profiles" ON profiles;
    DROP POLICY IF EXISTS "allow_service_role_insert" ON profiles;
    DROP POLICY IF EXISTS "allow_users_update_own" ON profiles;
    DROP POLICY IF EXISTS "profiles_read_all" ON profiles;
    DROP POLICY IF EXISTS "profiles_insert_service" ON profiles;
    DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
EXCEPTION 
    WHEN undefined_object THEN NULL;
END $$;

-- Create new simplified policies
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

-- Create or update indexes
DROP INDEX IF EXISTS idx_profiles_email;
DROP INDEX IF EXISTS idx_profiles_username;
CREATE UNIQUE INDEX idx_profiles_email ON profiles(email);
CREATE UNIQUE INDEX idx_profiles_username ON profiles(username);