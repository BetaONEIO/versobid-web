-- Update test user to be an admin
UPDATE profiles
SET is_admin = true
WHERE email = 'test@example.com';

-- Log the change
INSERT INTO admin_activity_log (
  admin_id,
  action,
  target_type,
  target_id,
  details
)
SELECT 
  id,
  'grant_admin',
  'user',
  id,
  jsonb_build_object(
    'email', email,
    'timestamp', now()
  )
FROM profiles
WHERE email = 'test@example.com';