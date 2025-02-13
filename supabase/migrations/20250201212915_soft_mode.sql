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
  -- Get username and full_name from metadata
  username := NEW.raw_user_meta_data->>'username';
  full_name := NEW.raw_user_meta_data->>'full_name';
  
  -- Fallback values if metadata is missing
  IF username IS NULL THEN
    username := REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-zA-Z0-9_]', '_', 'g');
  END IF;
  
  IF full_name IS NULL THEN
    full_name := username;
  END IF;

  -- Insert profile
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

  RETURN NEW;
EXCEPTION WHEN others THEN
  -- Log error details
  RAISE LOG 'Profile creation failed for user % (%). Error: % (SQLSTATE: %)',
    NEW.id, NEW.email, SQLERRM, SQLSTATE;
  RETURN NULL;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Drop existing policies
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

-- Add error logging table
CREATE TABLE IF NOT EXISTS auth_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  email TEXT,
  error TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create function to log auth errors
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