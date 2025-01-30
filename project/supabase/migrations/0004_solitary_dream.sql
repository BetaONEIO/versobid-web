/*
  # Fix profiles table and policies

  1. Changes
    - Drop existing policies
    - Update RLS policies
    - Ensure indexes exist
    - Update public profiles view

  2. Security
    - Maintain RLS
    - Recreate policies with proper permissions
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles (username);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles (email);

-- Recreate public profiles view
DROP VIEW IF EXISTS public_profiles;
CREATE VIEW public_profiles AS
  SELECT id, username, avatar_url
  FROM profiles;

-- Grant access to public profiles view
GRANT SELECT ON public_profiles TO anon, authenticated;