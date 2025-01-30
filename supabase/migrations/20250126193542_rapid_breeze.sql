-- Drop existing policies and triggers
DROP POLICY IF EXISTS "allow_public_read" ON profiles;
DROP POLICY IF EXISTS "allow_auth_insert" ON profiles;
DROP POLICY IF EXISTS "allow_individual_update" ON profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create simplified policies
CREATE POLICY "profiles_read_policy"
  ON profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "profiles_insert_policy"
  ON profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "profiles_update_policy"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Ensure proper grants
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON profiles TO service_role;
GRANT SELECT ON profiles TO anon;
GRANT SELECT, UPDATE ON profiles TO authenticated;

-- Create improved function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
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
      NEW.raw_user_meta_data->>'username',
      NEW.raw_user_meta_data->>'full_name',
      NOW(),
      false,
      null,
      null,
      false,
      false
    );
  EXCEPTION WHEN others THEN
    -- Log the error but don't prevent user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);