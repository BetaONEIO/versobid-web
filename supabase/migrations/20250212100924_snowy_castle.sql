-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create improved user creation handler with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  username text;
  full_name text;
  base_username text;
  counter integer := 0;
BEGIN
  -- Extract or generate base username from email
  base_username := REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-zA-Z0-9_]', '_', 'g');
  
  -- Get username from metadata or use base_username
  username := COALESCE(NEW.raw_user_meta_data->>'username', base_username);
  
  -- Get full name from metadata or use username
  full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', username);

  -- Ensure username is at least 3 characters
  IF length(username) < 3 THEN
    username := username || LPAD(floor(random() * 1000)::text, 3, '0');
  END IF;

  -- Try to insert profile with unique username
  LOOP
    BEGIN
      INSERT INTO public.profiles (
        id,
        email,
        username,
        full_name,
        created_at,
        is_admin,
        avatar_url,
        shipping_address,
        payment_setup,
        onboarding_completed
      ) VALUES (
        NEW.id,
        NEW.email,
        CASE 
          WHEN counter = 0 THEN username
          ELSE username || '_' || counter::text
        END,
        full_name,
        NOW(),
        false,
        null,
        null,
        false,
        false
      );
      
      -- If we get here, insert was successful
      RETURN NEW;
      
    EXCEPTION 
      WHEN unique_violation THEN
        -- Only retry 5 times
        IF counter >= 5 THEN
          RAISE EXCEPTION 'Could not generate unique username after 5 attempts';
        END IF;
        counter := counter + 1;
        CONTINUE;
      WHEN OTHERS THEN
        -- Log any other errors but don't prevent user creation
        INSERT INTO auth_errors (
          user_id,
          email,
          error,
          details
        ) VALUES (
          NEW.id,
          NEW.email,
          SQLERRM,
          jsonb_build_object(
            'state', SQLSTATE,
            'username', username,
            'full_name', full_name,
            'attempt', counter
          )
        );
        RETURN NEW;
    END;
  END LOOP;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Ensure proper grants
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create index for auth_errors if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_auth_errors_user_id ON auth_errors(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_errors_created_at ON auth_errors(created_at);