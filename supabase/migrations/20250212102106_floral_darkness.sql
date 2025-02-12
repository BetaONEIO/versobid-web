-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

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
  base_username text;
  counter integer := 0;
  max_attempts constant integer := 5;
BEGIN
  -- Extract or generate base username from email
  base_username := REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-zA-Z0-9_]', '_', 'g');
  
  -- Get username from metadata or use base_username
  username := COALESCE(NEW.raw_user_meta_data->>'username', base_username);
  
  -- Get full name from metadata or use username
  full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', username);

  -- Ensure username is at least 3 characters
  IF length(username) < 3 THEN
    username := username || LPAD(floor(random() * 1000)::text, 3, '0');
  END IF;

  -- Try to insert profile with unique username
  LOOP
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
        CASE 
          WHEN counter = 0 THEN username
          ELSE username || '_' || counter::text
        END,
        full_name,
        NOW(),
        false,
        null,
        null,
        false,
        false
      );
      
      -- If we get here, insert was successful
      RETURN NEW;
      
    EXCEPTION 
      WHEN unique_violation THEN
        -- Only retry up to max_attempts
        IF counter >= max_attempts THEN
          RAISE EXCEPTION 'Could not generate unique username after % attempts', max_attempts;
        END IF;
        counter := counter + 1;
        CONTINUE;
      WHEN OTHERS THEN
        -- Log any other errors but don't prevent user creation
        RAISE LOG 'Error creating profile for user %: % (SQLSTATE: %)', 
          NEW.id, SQLERRM, SQLSTATE;
        RETURN NEW;
    END;
  END LOOP;
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