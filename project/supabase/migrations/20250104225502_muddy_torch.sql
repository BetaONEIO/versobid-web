-- Drop all existing policies on profiles
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create new simplified policies
CREATE POLICY "Allow users to read any profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow users to insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow admins full access"
  ON profiles
  TO authenticated
  USING (
    CASE 
      WHEN is_admin = true THEN true
      ELSE auth.uid() = id
    END
  )
  WITH CHECK (
    CASE 
      WHEN is_admin = true THEN true
      ELSE auth.uid() = id
    END
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_auth_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);