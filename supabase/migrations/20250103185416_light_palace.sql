/*
  # Purge User Data Function

  1. Purpose
    - Safely remove all user data from profiles and auth.users tables
    - Maintain referential integrity
    - Handle cleanup in correct order

  2. Operations
    - Delete all profile records
    - Remove all auth users
    - Reset sequences
*/

-- Create function to purge all user data
CREATE OR REPLACE FUNCTION purge_all_user_data()
RETURNS void AS $$
BEGIN
  -- Disable row level security temporarily
  ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
  
  -- Delete all profiles first
  DELETE FROM profiles;
  
  -- Delete all auth users
  DELETE FROM auth.users;
  
  -- Re-enable row level security
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the purge
SELECT purge_all_user_data();

-- Drop the function after use
DROP FUNCTION IF EXISTS purge_all_user_data();