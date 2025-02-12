-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create improved function to handle new user creation
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
  -- Extract username and full_name from metadata
  username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    SPLIT_PART(NEW.email, '@', 1)
  );
  
  full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    username
  );

  -- Insert the profile with error handling
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
  EXCEPTION 
    WHEN unique_violation THEN
      -- Handle duplicate username by appending random numbers
      username := username || '_' || FLOOR(RANDOM() * 1000)::text;
      
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
    WHEN OTHERS THEN
      RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Drop existing policies safely
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "profiles_read_policy" ON profiles;
    DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
    DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
    DROP POLICY IF EXISTS "allow_read_all_profiles" ON profiles;
    DROP POLICY IF EXISTS "allow_service_role_insert" ON profiles;
    DROP POLICY IF EXISTS "allow_users_update_own" ON profiles;
EXCEPTION 
    WHEN undefined_object THEN 
        NULL;
END $$;

-- Create new policies safely
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'profiles_read_all'
    ) THEN
        CREATE POLICY "profiles_read_all"
          ON profiles
          FOR SELECT
          TO public
          USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'profiles_insert_service'
    ) THEN
        CREATE POLICY "profiles_insert_service"
          ON profiles
          FOR INSERT
          TO service_role
          WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'profiles_update_own'
    ) THEN
        CREATE POLICY "profiles_update_own"
          ON profiles
          FOR UPDATE
          TO authenticated
          USING (auth.uid() = id)
          WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Ensure proper grants
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON profiles TO service_role;
GRANT SELECT ON profiles TO anon;
GRANT SELECT, UPDATE ON profiles TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);