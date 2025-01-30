/*
  # Authentication Schema Setup
  
  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - References auth.users
      - `created_at` (timestamp)
      - `username` (text, unique)
      - `full_name` (text)
      - `avatar_url` (text, nullable)
      - `email` (text, unique)
  
  2. Security
    - Enable RLS on profiles table
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  email TEXT UNIQUE NOT NULL,
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create public profiles view for limited public access
CREATE VIEW public_profiles AS
  SELECT id, username, avatar_url
  FROM profiles;

-- Grant access to public profiles view
GRANT SELECT ON public_profiles TO anon, authenticated;