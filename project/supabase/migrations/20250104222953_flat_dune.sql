-- Check all signup attempts in the last hour
SELECT 
    created_at,
    email,
    error_message,
    request_data,
    error_details
FROM signup_errors
WHERE created_at > now() - interval '1 hour'
ORDER BY created_at DESC;

-- Check if the signup_errors table is empty
SELECT COUNT(*) as total_errors 
FROM signup_errors;

-- Check if the trigger is properly installed
SELECT 
    tgname as trigger_name,
    proname as function_name,
    tgenabled as enabled
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid = 'profiles'::regclass;