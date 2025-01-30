-- Function to safely delete a user and their associated data
CREATE OR REPLACE FUNCTION delete_user_by_email(admin_user_id UUID, target_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Check if the requesting user is an admin
  IF NOT is_admin(admin_user_id) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can delete users';
  END IF;

  -- Get the user ID for the target email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = target_email;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found with email: %', target_email;
  END IF;

  -- Delete profile first (this will cascade to related data)
  DELETE FROM profiles WHERE id = target_user_id;
  
  -- Delete the auth user
  DELETE FROM auth.users WHERE id = target_user_id;

  -- Log the admin action
  PERFORM log_admin_activity(
    admin_user_id,
    'delete_user',
    'user',
    target_user_id,
    jsonb_build_object('email', target_email)
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;