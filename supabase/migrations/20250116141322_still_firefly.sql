-- Update test user to be an admin\nUPDATE profiles\nSET is_admin = true\nWHERE email = 'test@example.com';
\n\n-- Log the change\nINSERT INTO admin_activity_log (\n  admin_id,\n  action,\n  target_type,\n  target_id,\n  details\n)\nSELECT \n  id,\n  'grant_admin',\n  'user',\n  id,\n  jsonb_build_object(\n    'email', email,\n    'timestamp', now()\n  )\nFROM profiles\nWHERE email = 'test@example.com';
;
