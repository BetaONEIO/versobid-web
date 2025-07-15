-- Grant admin access to tom@betaone.io
UPDATE profiles
SET is_admin = true
WHERE email = 'tom@betaone.io';

-- Create notification for the user
INSERT INTO notifications (
  user_id,
  type,
  message,
  data,
  read
)
SELECT 
  id,
  'success',
  'You have been granted admin access',
  jsonb_build_object('timestamp', now()),
  false
FROM profiles
WHERE email = 'tom@betaone.io';