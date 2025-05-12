\n\n-- Create function to purge all user data\nCREATE OR REPLACE FUNCTION purge_all_user_data()\nRETURNS void AS $$\nBEGIN\n  -- Disable row level security temporarily\n  ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
\n  \n  -- Delete all profiles first\n  DELETE FROM profiles;
\n  \n  -- Delete all auth users\n  DELETE FROM auth.users;
\n  \n  -- Re-enable row level security\n  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
\nEND;
\n$$ LANGUAGE plpgsql SECURITY DEFINER;
\n\n-- Execute the purge\nSELECT purge_all_user_data();
\n\n-- Drop the function after use\nDROP FUNCTION IF EXISTS purge_all_user_data();
;
