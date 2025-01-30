-- Drop existing policies first
DROP POLICY IF EXISTS "profiles_select_v6" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_v6" ON profiles;
DROP POLICY IF EXISTS "profiles_update_v6" ON profiles;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create simplified policies
CREATE POLICY "allow_public_read"
  ON profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "allow_auth_insert"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "allow_individual_update"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Ensure proper grants
GRANT ALL ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;

-- Create function to handle profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, full_name, created_at)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();