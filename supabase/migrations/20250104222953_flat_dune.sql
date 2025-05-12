-- Check all signup attempts in the last hour\nSELECT \n    created_at,\n    email,\n    error_message,\n    request_data,\n    error_details\nFROM signup_errors\nWHERE created_at > now() - interval '1 hour'\nORDER BY created_at DESC;
\n\n-- Check if the signup_errors table is empty\nSELECT COUNT(*) as total_errors \nFROM signup_errors;
\n\n-- Check if the trigger is properly installed\nSELECT \n    tgname as trigger_name,\n    proname as function_name,\n    tgenabled as enabled\nFROM pg_trigger t\nJOIN pg_proc p ON t.tgfoid = p.oid\nWHERE tgrelid = 'profiles'::regclass;
;
