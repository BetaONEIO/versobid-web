/*
  # Update profiles table and policies
  
  1. Changes
    - Add missing policies for profile management
    - Create public profiles view
    - Set up proper access control
*/

-- Create policies if they don't exist
DO $$ 
BEGIN
    -- Public profiles viewable policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Public profiles are viewable by everyone'
    ) THEN
        CREATE POLICY "Public profiles are viewable by everyone"
          ON profiles
          FOR SELECT
          USING (true);
    END IF;

    -- Insert own profile policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can insert their own profile'
    ) THEN
        CREATE POLICY "Users can insert their own profile"
          ON profiles
          FOR INSERT
          WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles (username);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles (email);

-- Drop view if exists and recreate
DROP VIEW IF EXISTS public_profiles;
CREATE VIEW public_profiles AS
  SELECT id, username, avatar_url
  FROM profiles;

-- Grant access to public profiles view
GRANT SELECT ON public_profiles TO anon, authenticated;