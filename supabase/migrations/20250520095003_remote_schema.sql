

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."check_onboarding_status"("user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id
    AND shipping_address IS NOT NULL
    AND payment_setup = true
    AND onboarding_completed = true
  );
END;$$;


ALTER FUNCTION "public"."check_onboarding_status"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_profile_status"("p_user_id" "uuid") RETURNS TABLE("has_auth" boolean, "has_profile" boolean, "error_message" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
    RETURN QUERY
    SELECT 
        EXISTS(SELECT 1 FROM auth.users WHERE id = p_user_id) as has_auth,
        EXISTS(SELECT 1 FROM public.profiles WHERE id = p_user_id) as has_profile,
        (SELECT error_message FROM public.signup_errors WHERE user_id = p_user_id ORDER BY created_at DESC LIMIT 1) as error_message;
END;$$;


ALTER FUNCTION "public"."check_profile_status"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_shipping_deadlines"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  payment RECORD;
BEGIN
  FOR payment IN
    SELECT *
    FROM payments
    WHERE status = 'completed'
    AND shipping_deadline < NOW()
    AND shipping_confirmed = false
  LOOP
    -- Apply negative rating
    PERFORM update_seller_rating(payment.seller_id, -1);
    
    -- Create notifications
    INSERT INTO notifications (user_id, type, message, data)
    VALUES
      (payment.buyer_id, 'shipping_overdue', 
       'Seller failed to ship item in time. A negative rating has been applied.',
       jsonb_build_object('payment_id', payment.id)),
      (payment.seller_id, 'negative_rating',
       'You received a negative rating for failing to ship item on time.',
       jsonb_build_object('payment_id', payment.id));
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."check_shipping_deadlines"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_user_exists"("check_email" "text", "check_username" "text") RETURNS TABLE("exists_email" boolean, "exists_username" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  RETURN QUERY
  SELECT 
    EXISTS(
      SELECT 1 
      FROM public.profiles 
      WHERE email = check_email
    ) as exists_email,
    EXISTS(
      SELECT 1 
      FROM public.profiles 
      WHERE username = check_username
    ) as exists_username;
END;$$;


ALTER FUNCTION "public"."check_user_exists"("check_email" "text", "check_username" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_expired_verification_tokens"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  DELETE FROM email_verification WHERE expires_at < now();
END;
$$;


ALTER FUNCTION "public"."cleanup_expired_verification_tokens"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_failed_signup"("p_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
    -- Delete auth user if exists
    DELETE FROM auth.users WHERE id = p_user_id;
    -- Delete profile if exists
    DELETE FROM public.profiles WHERE id = p_user_id;
    -- Log cleanup
    INSERT INTO public.signup_errors (user_id, email, error_message)
    VALUES (p_user_id, NULL, 'Cleaned up failed signup');
    RETURN TRUE;
END;$$;


ALTER FUNCTION "public"."cleanup_failed_signup"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_orphaned_profiles"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Delete profiles that don't have corresponding auth.users entries
  DELETE FROM profiles p
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users u 
    WHERE u.id = p.id
  );
END;
$$;


ALTER FUNCTION "public"."cleanup_orphaned_profiles"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_profile_on_user_delete"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  DELETE FROM public.profiles WHERE id = OLD.id;
  RETURN OLD;
END;$$;


ALTER FUNCTION "public"."cleanup_profile_on_user_delete"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."complete_onboarding"("user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  UPDATE public.profiles
  SET onboarding_completed = true
  WHERE id = user_id;
  
  RETURN FOUND;
END;$$;


ALTER FUNCTION "public"."complete_onboarding"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_bid_notification"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  -- Notify seller of new bid
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (user_id, type, message, data)
    SELECT 
      items.seller_id,
      'bid_received',
      'You received a new bid on ' || items.title,
      jsonb_build_object(
        'bid_id', NEW.id,
        'item_id', NEW.item_id,
        'amount', NEW.amount
      )
    FROM items
    WHERE items.id = NEW.item_id;
  END IF;

  -- Notify bidder of bid status change
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO public.notifications (user_id, type, message, data)
    SELECT 
      NEW.bidder_id,
      'bid_' || NEW.status,
      CASE NEW.status
        WHEN 'accepted' THEN 'Your bid was accepted!'
        WHEN 'rejected' THEN 'Your bid was rejected'
        ELSE 'Your bid status was updated to ' || NEW.status
      END,
      jsonb_build_object(
        'bid_id', NEW.id,
        'item_id', NEW.item_id,
        'status', NEW.status
      );
  END IF;

  RETURN NEW;
END;$$;


ALTER FUNCTION "public"."create_bid_notification"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_new_profile"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_new_profile"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_profile_safely"("user_id" "uuid", "user_email" "text", "user_username" "text", "user_full_name" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
DECLARE
  final_username TEXT;
  attempt_count INTEGER := 0;
  MAX_ATTEMPTS CONSTANT INTEGER := 3;
BEGIN
  -- Initialize username
  final_username := COALESCE(
    user_username,
    REGEXP_REPLACE(SPLIT_PART(user_email, '@', 1), '[^a-zA-Z0-9_]', '_', 'g')
  );
  
  -- Ensure username meets requirements
  IF length(final_username) < 3 THEN
    final_username := final_username || FLOOR(RANDOM() * 900 + 100)::text;
  END IF;
  
  LOOP
    EXIT WHEN attempt_count >= MAX_ATTEMPTS;
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
        user_id,
        user_email,
        final_username,
        COALESCE(user_full_name, final_username),
        NOW(),
        false,
        null,
        null,
        false,
        false
      );
      
      RETURN true;
      
    EXCEPTION 
      WHEN unique_violation THEN
        -- Only retry for username violations
        IF attempt_count < MAX_ATTEMPTS THEN
          final_username := REGEXP_REPLACE(final_username, '_\d+$', ''); -- Remove any existing numbers
          final_username := final_username || '_' || (floor(random() * 9000 + 1000))::text;
          attempt_count := attempt_count + 1;
          CONTINUE;
        END IF;
      WHEN OTHERS THEN
        -- Log other errors
        INSERT INTO auth_errors (
          user_id,
          email,
          error,
          details
        ) VALUES (
          user_id,
          user_email,
          SQLERRM,
          jsonb_build_object(
            'state', SQLSTATE,
            'attempt', attempt_count,
            'username', final_username
          )
        );
        RETURN false;
    END;
  END LOOP;
  
  -- Log failure after max attempts
  INSERT INTO auth_errors (
    user_id,
    email,
    error,
    details
  ) VALUES (
    user_id,
    user_email,
    'Failed to create profile after maximum attempts',
    jsonb_build_object(
      'max_attempts', MAX_ATTEMPTS,
      'final_username', final_username
    )
  );
  
  RETURN false;
END;
$_$;


ALTER FUNCTION "public"."create_profile_safely"("user_id" "uuid", "user_email" "text", "user_username" "text", "user_full_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_user_by_email"("admin_user_id" "uuid", "target_email" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."delete_user_by_email"("admin_user_id" "uuid", "target_email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_email_verification"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    -- Log welcome email
    -- INSERT INTO public.email_logs (
    --   recipient,
    --   subject,
    --   template_name,
    --   status
    -- ) VALUES (
    --   NEW.email,
    --   'Welcome to VersoBid - Email Verified!',
    --   'welcome',
    --   'pending'
    -- );

    -- Create welcome notification
    INSERT INTO public.notifications (
      user_id,
      type,
      message,
      data
    ) VALUES (
      NEW.id,
      'welcome',
      'Welcome to VersoBid! Your email has been verified.',
      jsonb_build_object(
        'email', NEW.email,
        'verified_at', NEW.email_confirmed_at
      )
    );
  END IF;

  RETURN NEW;
END;$$;


ALTER FUNCTION "public"."handle_email_verification"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Insert verification email into email_logs
  INSERT INTO public.email_logs (
    recipient,
    subject,
    template_name,
    status,
    data
  ) VALUES (
    NEW.email,
    'Verify your VersoBid email address',
    'verify_email',
    'pending',
    jsonb_build_object(
      'verification_link',
      current_setting('app.frontend_url', true) || '/verify-email?token=' || 
        encode(gen_random_bytes(32), 'base64')
    )
  );

  -- Create verification notification
  INSERT INTO notifications (
    user_id,
    type,
    message,
    data
  ) VALUES (
    NEW.id,
    'email_verification',
    'Please verify your email address to access all features',
    jsonb_build_object(
      'email', NEW.email
    )
  );

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_profile_creation"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
    -- Log the attempt with full details
    INSERT INTO public.signup_errors (
        user_id,
        email,
        error_message,
        request_data,
        error_details
    ) VALUES (
        NEW.id,
        NEW.email,
        'Profile creation started',
        row_to_json(NEW)::jsonb,
        jsonb_build_object(
            'timestamp', now(),
            'auth_exists', EXISTS(SELECT 1 FROM auth.users WHERE id = NEW.id)
        )
    );

    -- Perform validations
    -- IF NEW.email IS NULL OR NEW.email = '' THEN
    --     RAISE EXCEPTION 'Email cannot be empty';
    -- END IF;

    -- IF NEW.username IS NULL OR NEW.username = '' THEN
    --     RAISE EXCEPTION 'Username cannot be empty';
    -- END IF;

    -- Check for duplicate email
    IF EXISTS (
        SELECT 1 FROM public.profiles
        WHERE email = NEW.email
        AND id != NEW.id
    ) THEN
        RAISE EXCEPTION 'Email already exists';
    END IF;

    -- Check for duplicate username
    IF EXISTS (
        SELECT 1 FROM public.profiles
        WHERE username = NEW.username
        AND id != NEW.id
    ) THEN
        RAISE EXCEPTION 'Username already exists';
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log the error with full details
    INSERT INTO public.signup_errors (
        user_id,
        email,
        error_message,
        request_data,
        error_details
    ) VALUES (
        NEW.id,
        NEW.email,
        'Profile creation failed: ' || SQLERRM,
        row_to_json(NEW)::jsonb,
        jsonb_build_object(
            'error_code', SQLSTATE,
            'error_message', SQLERRM,
            'stack_trace', pg_backend_pid()
        )
    );
    RAISE;
END;$$;


ALTER FUNCTION "public"."handle_profile_creation"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND is_admin = true
  );
END;
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"("user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND is_admin = true
  );
END;
$$;


ALTER FUNCTION "public"."is_admin"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_admin_activity"("admin_id" "uuid", "action" "text", "target_type" "text", "target_id" "uuid", "details" "jsonb" DEFAULT NULL::"jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO admin_activity_log (admin_id, action, target_type, target_id, details)
  VALUES (admin_id, action, target_type, target_id, details);
END;
$$;


ALTER FUNCTION "public"."log_admin_activity"("admin_id" "uuid", "action" "text", "target_type" "text", "target_id" "uuid", "details" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_auth_error"("p_user_id" "uuid", "p_email" "text", "p_error" "text", "p_details" "jsonb" DEFAULT NULL::"jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO auth_errors (user_id, email, error, details)
  VALUES (p_user_id, p_email, p_error, p_details);
END;
$$;


ALTER FUNCTION "public"."log_auth_error"("p_user_id" "uuid", "p_email" "text", "p_error" "text", "p_details" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_signup_attempt"("p_user_id" "uuid", "p_email" "text", "p_request_data" "jsonb" DEFAULT NULL::"jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO signup_errors (
        user_id,
        email,
        error_message,
        request_data,
        error_details
    ) VALUES (
        p_user_id,
        p_email,
        'Signup attempt started',
        p_request_data,
        jsonb_build_object(
            'timestamp', now(),
            'auth_exists', EXISTS(SELECT 1 FROM auth.users WHERE id = p_user_id),
            'profile_exists', EXISTS(SELECT 1 FROM profiles WHERE id = p_user_id)
        )
    );
EXCEPTION WHEN OTHERS THEN
    -- Log any errors in the logging itself
    INSERT INTO signup_errors (
        user_id,
        email,
        error_message,
        error_details
    ) VALUES (
        p_user_id,
        p_email,
        'Failed to log signup attempt: ' || SQLERRM,
        jsonb_build_object(
            'error_code', SQLSTATE,
            'error_message', SQLERRM
        )
    );
END;
$$;


ALTER FUNCTION "public"."log_signup_attempt"("p_user_id" "uuid", "p_email" "text", "p_request_data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_signup_error"("p_user_id" "uuid", "p_email" "text", "p_error_message" "text", "p_error_details" "jsonb" DEFAULT NULL::"jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
    INSERT INTO public.signup_errors (user_id, email, error_message, error_details)
    VALUES (p_user_id, p_email, p_error_message, p_error_details);
END;$$;


ALTER FUNCTION "public"."log_signup_error"("p_user_id" "uuid", "p_email" "text", "p_error_message" "text", "p_error_details" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."manage_admin_status"("admin_id" "uuid", "target_user_id" "uuid", "make_admin" boolean) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Verify admin status
  IF NOT is_admin(admin_id) THEN
    RAISE EXCEPTION 'Unauthorized: User is not an admin';
  END IF;

  UPDATE profiles 
  SET is_admin = make_admin
  WHERE id = target_user_id;

  RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."manage_admin_status"("admin_id" "uuid", "target_user_id" "uuid", "make_admin" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."manage_user"("admin_id" "uuid", "target_user_id" "uuid", "action" "text", "updates" "jsonb" DEFAULT NULL::"jsonb") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  -- Verify admin status
  IF NOT is_admin(admin_id) THEN
    RAISE EXCEPTION 'Unauthorized: User is not an admin';
  END IF;

  CASE action
    WHEN 'update' THEN
      UPDATE public.profiles 
      SET 
        full_name = COALESCE(updates->>'full_name', full_name),
        email = COALESCE(updates->>'email', email),
        username = COALESCE(updates->>'username', username)
      WHERE id = target_user_id;
    WHEN 'delete' THEN
      -- Don't allow deleting other admins
      IF EXISTS (SELECT 1 FROM profiles WHERE id = target_user_id AND is_admin = true) THEN
        RAISE EXCEPTION 'Cannot delete admin users';
      END IF;
      DELETE FROM public.profiles WHERE id = target_user_id;
    ELSE
      RAISE EXCEPTION 'Invalid action';
  END CASE;

  RETURN TRUE;
END;$$;


ALTER FUNCTION "public"."manage_user"("admin_id" "uuid", "target_user_id" "uuid", "action" "text", "updates" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_incomplete_onboarding"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  IF NEW.onboarding_completed = false THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      message,
      data
    ) VALUES (
      NEW.id,
      'onboarding_reminder',
      'Complete your profile setup to start using all features',
      jsonb_build_object(
        'onboarding_step', 
        CASE 
          WHEN NEW.shipping_address IS NULL THEN 'address'
          WHEN NEW.payment_setup = false THEN 'payment'
          ELSE 'incomplete'
        END
      )
    );
  END IF;
  RETURN NEW;
END;$$;


ALTER FUNCTION "public"."notify_incomplete_onboarding"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."safe_delete_user"("target_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_email TEXT;
BEGIN
    -- Get user email for logging
    SELECT email INTO v_email
    FROM auth.users
    WHERE id = target_user_id;

    IF v_email IS NULL THEN
        RAISE EXCEPTION 'User not found with ID: %', target_user_id;
    END IF;

    -- Begin transaction
    BEGIN
        -- Delete from profiles first (this should cascade to related data)
        DELETE FROM profiles WHERE id = target_user_id;
        
        -- Delete from auth.users
        DELETE FROM auth.users WHERE id = target_user_id;

        -- Log successful deletion
        INSERT INTO signup_errors (user_id, email, error_message)
        VALUES (target_user_id, v_email, 'User successfully deleted');

        RETURN TRUE;
    EXCEPTION WHEN OTHERS THEN
        -- Log the error
        INSERT INTO signup_errors (user_id, email, error_message, error_details)
        VALUES (
            target_user_id,
            v_email,
            'Failed to delete user: ' || SQLERRM,
            jsonb_build_object(
                'error_code', SQLSTATE,
                'error_message', SQLERRM,
                'error_detail', SQLSTATE || ' - ' || SQLERRM
            )
        );
        RAISE;
    END;
END;
$$;


ALTER FUNCTION "public"."safe_delete_user"("target_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."send_verification_email"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Insert verification email into email_logs
  INSERT INTO email_logs (
    recipient,
    subject,
    template_name,
    status,
    data
  ) VALUES (
    NEW.email,
    'Verify your VersoBid email address',
    'verify_email',
    'pending',
    jsonb_build_object(
      'verification_link',
      current_setting('app.frontend_url', true) || '/verify-email?token=' || 
        encode(gen_random_bytes(32), 'base64')
    )
  );

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."send_verification_email"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."send_welcome_email"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  -- Insert welcome email into email_logs
  SET search_path TO public, auth;

  INSERT INTO public.email_logs (
    recipient,
    subject,
    template_name,
    status,
    data
  ) VALUES (
    NEW.email,
    'Welcome to VersoBid!',
    'welcome',
    'pending',
    jsonb_build_object(
      -- 'name', COALESCE(NEW.full_name, NEW.username),
      'dashboard_link', current_setting('app.frontend_url', true) || '/dashboard'
    )
  );

  -- Create welcome notification
  -- INSERT INTO public.notifications (
  --   user_id,
  --   type,
  --   message
  --   -- data
  -- ) VALUES (
  --   NEW.id,
  --   'success',
  --   'Welcome to VersoBid! Complete your profile to get started.'
  --   -- jsonb_build_object(
  --   --   'profile_link', '/profile/' || NEW.username
  --   -- )
  -- );

  RETURN NEW;
END;$$;


ALTER FUNCTION "public"."send_welcome_email"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_cleanup_expired_verification_tokens"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  DELETE FROM email_verification
  WHERE expires_at < NOW();
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."trigger_cleanup_expired_verification_tokens"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_email_log_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_email_log_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_seller_rating"("seller_id" "uuid", "rating_change" integer) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  UPDATE public.profiles
  SET rating = rating + rating_change
  WHERE id = seller_id;
END;$$;


ALTER FUNCTION "public"."update_seller_rating"("seller_id" "uuid", "rating_change" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_profile"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  -- Basic validation
  -- IF NEW.email IS NULL OR NEW.email = '' THEN
  --   RAISE EXCEPTION 'Email cannot be empty';
  -- END IF;
  
  IF NEW.username IS NULL OR NEW.username = '' THEN
    RAISE EXCEPTION 'Username cannot be empty';
  END IF;

  RETURN NEW;
END;$$;


ALTER FUNCTION "public"."validate_profile"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_profile_creation"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  -- Check if email already exists
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE email = NEW.email
    AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'Email already exists';
  END IF;

  -- Check if username already exists
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE username = NEW.username
    AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'Username already exists';
  END IF;

  RETURN NEW;
END;$$;


ALTER FUNCTION "public"."validate_profile_creation"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_profile_email"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  -- Basic validation
  -- IF NEW.email IS NULL OR NEW.email = '' THEN
  --   RAISE EXCEPTION 'Email cannot be empty';
  -- END IF;

  -- Check for duplicates
  IF EXISTS (
    SELECT 1 FROM profiles 
    WHERE email = NEW.email 
    AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'Email already exists';
  END IF;

  RETURN NEW;
END;$$;


ALTER FUNCTION "public"."validate_profile_email"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_service_details"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Only validate if this is a service type item
  IF NEW.type = 'service' THEN
    -- Check if service_details is present and has required fields
    IF NEW.service_details IS NULL OR 
       NOT (NEW.service_details ? 'rateType' AND 
            NEW.service_details ? 'availability' AND
            NEW.service_details ? 'remote') THEN
      RAISE EXCEPTION 'Service listings must include rate type, availability, and remote work status';
    END IF;
    
    -- Validate rate type
    IF NOT (NEW.service_details->>'rateType' IN ('hourly', 'fixed', 'project')) THEN
      RAISE EXCEPTION 'Invalid rate type for service';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_service_details"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_activity_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "admin_id" "uuid" NOT NULL,
    "action" "text" NOT NULL,
    "target_type" "text" NOT NULL,
    "target_id" "uuid" NOT NULL,
    "details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."admin_activity_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."auth_errors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "email" "text",
    "error" "text",
    "details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."auth_errors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bids" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "item_id" "uuid",
    "bidder_id" "uuid",
    "amount" numeric NOT NULL,
    "message" "text",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "bids_amount_check" CHECK (("amount" >= (0)::numeric)),
    CONSTRAINT "valid_status" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."bids" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."email_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "recipient" "text",
    "subject" "text" NOT NULL,
    "template_name" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "error" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "data" "jsonb",
    CONSTRAINT "valid_status" CHECK (("status" = ANY (ARRAY['pending'::"text", 'sent'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."email_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."email_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "subject" "text" NOT NULL,
    "html_content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."email_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."email_verification" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "token" "text" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."email_verification" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "min_price" numeric NOT NULL,
    "max_price" numeric NOT NULL,
    "seller_id" "uuid" NOT NULL,
    "category" "text" NOT NULL,
    "shipping_options" "jsonb" DEFAULT '[]'::"jsonb",
    "condition" "text",
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "image_url" "text",
    "type" "text" DEFAULT 'item'::"text",
    "service_details" "jsonb",
    CONSTRAINT "items_check" CHECK (("max_price" >= "min_price")),
    CONSTRAINT "items_min_price_check" CHECK (("min_price" >= (0)::numeric)),
    CONSTRAINT "items_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'completed'::"text", 'archived'::"text"]))),
    CONSTRAINT "items_type_check" CHECK (("type" = ANY (ARRAY['item'::"text", 'service'::"text"])))
);


ALTER TABLE "public"."items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."listings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "price" numeric NOT NULL,
    "seller_id" "uuid" NOT NULL,
    "category" "text" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "listings_price_check" CHECK (("price" >= (0)::numeric)),
    CONSTRAINT "listings_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'sold'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."listings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "message" "text" NOT NULL,
    "read" boolean DEFAULT false,
    "data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "valid_notification_types" CHECK (("type" = ANY (ARRAY['success'::"text", 'error'::"text", 'info'::"text", 'warning'::"text", 'bid_received'::"text", 'bid_accepted'::"text", 'bid_rejected'::"text", 'payment_received'::"text", 'shipping_update'::"text", 'item_sold'::"text", 'email_verification'::"text", 'onboarding_reminder'::"text", 'service_booked'::"text", 'service_completed'::"text"])))
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "amount" numeric NOT NULL,
    "currency" "text" NOT NULL,
    "item_id" "uuid",
    "buyer_id" "uuid",
    "seller_id" "uuid",
    "transaction_id" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "provider" "text" NOT NULL,
    "shipping_deadline" timestamp with time zone,
    "shipping_confirmed" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "payments_amount_check" CHECK (("amount" >= (0)::numeric))
);


ALTER TABLE "public"."payments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "username" "text" NOT NULL,
    "full_name" "text" NOT NULL,
    "avatar_url" "text",
    "is_admin" boolean DEFAULT false,
    "rating" numeric DEFAULT 0,
    "shipping_address" "jsonb",
    "payment_setup" boolean DEFAULT false,
    "onboarding_completed" boolean DEFAULT false,
    "email" "text",
    "email_verified" boolean DEFAULT false,
    "is_verified" boolean DEFAULT false,
    CONSTRAINT "username_length" CHECK (("char_length"("username") >= 3))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."profiles"."email" IS 'Email';



CREATE OR REPLACE VIEW "public"."public_profiles" WITH ("security_invoker"='on') AS
 SELECT "profiles"."id",
    "profiles"."username",
    "profiles"."avatar_url"
   FROM "public"."profiles";


ALTER TABLE "public"."public_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."signup_errors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "email" "text",
    "error_message" "text",
    "error_details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "request_data" "jsonb",
    "stack_trace" "text"
);


ALTER TABLE "public"."signup_errors" OWNER TO "postgres";


ALTER TABLE ONLY "public"."admin_activity_log"
    ADD CONSTRAINT "admin_activity_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."auth_errors"
    ADD CONSTRAINT "auth_errors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bids"
    ADD CONSTRAINT "bids_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_logs"
    ADD CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_templates"
    ADD CONSTRAINT "email_templates_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."email_templates"
    ADD CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_verification"
    ADD CONSTRAINT "email_verification_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_verification"
    ADD CONSTRAINT "email_verification_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."items"
    ADD CONSTRAINT "items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."listings"
    ADD CONSTRAINT "listings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."signup_errors"
    ADD CONSTRAINT "signup_errors_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_auth_errors_created_at" ON "public"."auth_errors" USING "btree" ("created_at");



CREATE INDEX "idx_auth_errors_user_id" ON "public"."auth_errors" USING "btree" ("user_id");



CREATE INDEX "idx_bids_bidder_id" ON "public"."bids" USING "btree" ("bidder_id");



CREATE INDEX "idx_bids_item_id" ON "public"."bids" USING "btree" ("item_id");



CREATE INDEX "idx_bids_status" ON "public"."bids" USING "btree" ("status");



CREATE INDEX "idx_email_logs_created_at" ON "public"."email_logs" USING "btree" ("created_at");



CREATE INDEX "idx_email_logs_recipient" ON "public"."email_logs" USING "btree" ("recipient");



CREATE INDEX "idx_email_logs_status" ON "public"."email_logs" USING "btree" ("status");



CREATE INDEX "idx_email_templates_name" ON "public"."email_templates" USING "btree" ("name");



CREATE INDEX "idx_email_verification_expires_at" ON "public"."email_verification" USING "btree" ("expires_at");



CREATE INDEX "idx_email_verification_token" ON "public"."email_verification" USING "btree" ("token");



CREATE INDEX "idx_items_category" ON "public"."items" USING "btree" ("category");



CREATE INDEX "idx_items_seller_id" ON "public"."items" USING "btree" ("seller_id");



CREATE INDEX "idx_items_status" ON "public"."items" USING "btree" ("status");



CREATE INDEX "idx_items_type" ON "public"."items" USING "btree" ("type");



CREATE INDEX "idx_notifications_created_at" ON "public"."notifications" USING "btree" ("created_at");



CREATE INDEX "idx_notifications_read" ON "public"."notifications" USING "btree" ("read");



CREATE INDEX "idx_notifications_type" ON "public"."notifications" USING "btree" ("type");



CREATE INDEX "idx_notifications_user_id" ON "public"."notifications" USING "btree" ("user_id");



CREATE INDEX "idx_payments_buyer_id" ON "public"."payments" USING "btree" ("buyer_id");



CREATE INDEX "idx_payments_item_id" ON "public"."payments" USING "btree" ("item_id");



CREATE INDEX "idx_payments_seller_id" ON "public"."payments" USING "btree" ("seller_id");



CREATE INDEX "idx_payments_shipping_deadline" ON "public"."payments" USING "btree" ("shipping_deadline");



CREATE INDEX "idx_payments_status" ON "public"."payments" USING "btree" ("status");



CREATE INDEX "idx_profiles_auth_id" ON "public"."profiles" USING "btree" ("id");



CREATE INDEX "idx_profiles_id" ON "public"."profiles" USING "btree" ("id");



CREATE INDEX "idx_profiles_is_admin" ON "public"."profiles" USING "btree" ("is_admin");



CREATE INDEX "idx_profiles_onboarding_completed" ON "public"."profiles" USING "btree" ("onboarding_completed");



CREATE UNIQUE INDEX "idx_profiles_username" ON "public"."profiles" USING "btree" ("username");



CREATE INDEX "items_category_idx" ON "public"."items" USING "btree" ("category");



CREATE INDEX "items_seller_id_idx" ON "public"."items" USING "btree" ("seller_id");



CREATE INDEX "items_status_idx" ON "public"."items" USING "btree" ("status");



CREATE INDEX "listings_category_idx" ON "public"."listings" USING "btree" ("category");



CREATE INDEX "listings_seller_id_idx" ON "public"."listings" USING "btree" ("seller_id");



CREATE INDEX "listings_status_idx" ON "public"."listings" USING "btree" ("status");



CREATE INDEX "profiles_id_idx" ON "public"."profiles" USING "btree" ("id");



CREATE INDEX "profiles_username_idx" ON "public"."profiles" USING "btree" ("username");



CREATE OR REPLACE TRIGGER "cleanup_expired_verification_tokens_trigger" AFTER INSERT ON "public"."email_verification" FOR EACH STATEMENT EXECUTE FUNCTION "public"."trigger_cleanup_expired_verification_tokens"();



CREATE OR REPLACE TRIGGER "handle_profile_creation_trigger" BEFORE INSERT ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_profile_creation"();



CREATE OR REPLACE TRIGGER "notify_incomplete_onboarding_trigger" AFTER INSERT ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."notify_incomplete_onboarding"();



CREATE OR REPLACE TRIGGER "on_bid_created" AFTER INSERT ON "public"."bids" FOR EACH ROW EXECUTE FUNCTION "public"."create_bid_notification"();



CREATE OR REPLACE TRIGGER "on_bid_updated" AFTER UPDATE OF "status" ON "public"."bids" FOR EACH ROW EXECUTE FUNCTION "public"."create_bid_notification"();



CREATE OR REPLACE TRIGGER "send_welcome_email_trigger" AFTER INSERT ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."send_welcome_email"();



CREATE OR REPLACE TRIGGER "update_email_logs_timestamp" BEFORE UPDATE ON "public"."email_logs" FOR EACH ROW EXECUTE FUNCTION "public"."update_email_log_timestamp"();



CREATE OR REPLACE TRIGGER "validate_profile_creation_trigger" BEFORE INSERT ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."validate_profile_creation"();



CREATE OR REPLACE TRIGGER "validate_profile_trigger" BEFORE INSERT OR UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."validate_profile"();



CREATE OR REPLACE TRIGGER "validate_service_trigger" BEFORE INSERT OR UPDATE ON "public"."items" FOR EACH ROW EXECUTE FUNCTION "public"."validate_service_details"();



ALTER TABLE ONLY "public"."admin_activity_log"
    ADD CONSTRAINT "admin_activity_log_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."bids"
    ADD CONSTRAINT "bids_bidder_id_fkey" FOREIGN KEY ("bidder_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bids"
    ADD CONSTRAINT "bids_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."email_verification"
    ADD CONSTRAINT "email_verification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."items"
    ADD CONSTRAINT "items_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."listings"
    ADD CONSTRAINT "listings_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



CREATE POLICY "Admins can manage email logs" ON "public"."email_logs" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Admins can view all activity" ON "public"."admin_activity_log" FOR SELECT TO "authenticated" USING ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "Allow authenticated users to delete their own profiles" ON "public"."profiles" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Allow authenticated users to insert their own profiles" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Allow authenticated users to update their own profiles" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Allow authenticated users to view their own profiles" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Allow read access to email templates" ON "public"."email_templates" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Anyone can view active listings" ON "public"."items" FOR SELECT USING (("status" = 'active'::"text"));



CREATE POLICY "Anyone can view active listings" ON "public"."listings" FOR SELECT USING (("status" = 'active'::"text"));



CREATE POLICY "Bidders can view their own bids" ON "public"."bids" FOR SELECT TO "authenticated" USING ((("bidder_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."items"
  WHERE (("items"."id" = "bids"."item_id") AND ("items"."seller_id" = "auth"."uid"()))))));



CREATE POLICY "Public can view email templates" ON "public"."email_templates" FOR SELECT USING (true);



CREATE POLICY "Sellers can update bid status" ON "public"."bids" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."items"
  WHERE (("items"."id" = "bids"."item_id") AND ("items"."seller_id" = "auth"."uid"())))));



CREATE POLICY "Sellers can update their own listings" ON "public"."listings" FOR UPDATE USING (("auth"."uid"() = "seller_id"));



CREATE POLICY "Users can create bids on others' items" ON "public"."bids" FOR INSERT TO "authenticated" WITH CHECK ((("bidder_id" = "auth"."uid"()) AND (NOT (EXISTS ( SELECT 1
   FROM "public"."items"
  WHERE (("items"."id" = "bids"."item_id") AND ("items"."seller_id" = "auth"."uid"())))))));



CREATE POLICY "Users can create their own items" ON "public"."items" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "seller_id"));



CREATE POLICY "Users can create their own listings" ON "public"."listings" FOR INSERT WITH CHECK (("auth"."uid"() = "seller_id"));



CREATE POLICY "Users can read their own verification records" ON "public"."email_verification" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own items" ON "public"."items" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "seller_id"));



CREATE POLICY "Users can update their own notifications" ON "public"."notifications" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own notifications" ON "public"."notifications" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."admin_activity_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."auth_errors" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "auth_errors_admin_only" ON "public"."auth_errors" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



ALTER TABLE "public"."bids" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "delete_own_signup_errors" ON "public"."signup_errors" FOR DELETE USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."email_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."email_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."email_verification" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "insert_signup_errors" ON "public"."signup_errors" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "items_insert_policy" ON "public"."items" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "seller_id"));



CREATE POLICY "items_select_policy" ON "public"."items" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "items_update_policy" ON "public"."items" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "seller_id")) WITH CHECK (("auth"."uid"() = "seller_id"));



ALTER TABLE "public"."listings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "payments_select_policy" ON "public"."payments" FOR SELECT TO "authenticated" USING ((("buyer_id" = "auth"."uid"()) OR ("seller_id" = "auth"."uid"())));



CREATE POLICY "payments_update_policy" ON "public"."payments" FOR UPDATE TO "authenticated" USING (("seller_id" = "auth"."uid"()));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "select_own_signup_errors" ON "public"."signup_errors" FOR SELECT USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."signup_errors" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "update_own_signup_errors" ON "public"."signup_errors" FOR UPDATE USING (("user_id" = "auth"."uid"()));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."check_onboarding_status"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_onboarding_status"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_onboarding_status"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_profile_status"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_profile_status"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_profile_status"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_shipping_deadlines"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_shipping_deadlines"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_shipping_deadlines"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_user_exists"("check_email" "text", "check_username" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_user_exists"("check_email" "text", "check_username" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_user_exists"("check_email" "text", "check_username" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_expired_verification_tokens"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_expired_verification_tokens"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_expired_verification_tokens"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_failed_signup"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_failed_signup"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_failed_signup"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_orphaned_profiles"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_orphaned_profiles"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_orphaned_profiles"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_profile_on_user_delete"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_profile_on_user_delete"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_profile_on_user_delete"() TO "service_role";



GRANT ALL ON FUNCTION "public"."complete_onboarding"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."complete_onboarding"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."complete_onboarding"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_bid_notification"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_bid_notification"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_bid_notification"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_new_profile"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_new_profile"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_new_profile"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_profile_safely"("user_id" "uuid", "user_email" "text", "user_username" "text", "user_full_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_profile_safely"("user_id" "uuid", "user_email" "text", "user_username" "text", "user_full_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_profile_safely"("user_id" "uuid", "user_email" "text", "user_username" "text", "user_full_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_user_by_email"("admin_user_id" "uuid", "target_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_user_by_email"("admin_user_id" "uuid", "target_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_user_by_email"("admin_user_id" "uuid", "target_email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_email_verification"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_email_verification"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_email_verification"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_profile_creation"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_profile_creation"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_profile_creation"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_admin_activity"("admin_id" "uuid", "action" "text", "target_type" "text", "target_id" "uuid", "details" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."log_admin_activity"("admin_id" "uuid", "action" "text", "target_type" "text", "target_id" "uuid", "details" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_admin_activity"("admin_id" "uuid", "action" "text", "target_type" "text", "target_id" "uuid", "details" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_auth_error"("p_user_id" "uuid", "p_email" "text", "p_error" "text", "p_details" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."log_auth_error"("p_user_id" "uuid", "p_email" "text", "p_error" "text", "p_details" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_auth_error"("p_user_id" "uuid", "p_email" "text", "p_error" "text", "p_details" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_signup_attempt"("p_user_id" "uuid", "p_email" "text", "p_request_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."log_signup_attempt"("p_user_id" "uuid", "p_email" "text", "p_request_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_signup_attempt"("p_user_id" "uuid", "p_email" "text", "p_request_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_signup_error"("p_user_id" "uuid", "p_email" "text", "p_error_message" "text", "p_error_details" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."log_signup_error"("p_user_id" "uuid", "p_email" "text", "p_error_message" "text", "p_error_details" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_signup_error"("p_user_id" "uuid", "p_email" "text", "p_error_message" "text", "p_error_details" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."manage_admin_status"("admin_id" "uuid", "target_user_id" "uuid", "make_admin" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."manage_admin_status"("admin_id" "uuid", "target_user_id" "uuid", "make_admin" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."manage_admin_status"("admin_id" "uuid", "target_user_id" "uuid", "make_admin" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."manage_user"("admin_id" "uuid", "target_user_id" "uuid", "action" "text", "updates" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."manage_user"("admin_id" "uuid", "target_user_id" "uuid", "action" "text", "updates" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."manage_user"("admin_id" "uuid", "target_user_id" "uuid", "action" "text", "updates" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_incomplete_onboarding"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_incomplete_onboarding"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_incomplete_onboarding"() TO "service_role";



GRANT ALL ON FUNCTION "public"."safe_delete_user"("target_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."safe_delete_user"("target_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."safe_delete_user"("target_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."send_verification_email"() TO "anon";
GRANT ALL ON FUNCTION "public"."send_verification_email"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."send_verification_email"() TO "service_role";



GRANT ALL ON FUNCTION "public"."send_welcome_email"() TO "anon";
GRANT ALL ON FUNCTION "public"."send_welcome_email"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."send_welcome_email"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_cleanup_expired_verification_tokens"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_cleanup_expired_verification_tokens"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_cleanup_expired_verification_tokens"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_email_log_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_email_log_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_email_log_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_seller_rating"("seller_id" "uuid", "rating_change" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."update_seller_rating"("seller_id" "uuid", "rating_change" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_seller_rating"("seller_id" "uuid", "rating_change" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_profile"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_profile"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_profile"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_profile_creation"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_profile_creation"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_profile_creation"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_profile_email"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_profile_email"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_profile_email"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_service_details"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_service_details"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_service_details"() TO "service_role";


















GRANT ALL ON TABLE "public"."admin_activity_log" TO "anon";
GRANT ALL ON TABLE "public"."admin_activity_log" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_activity_log" TO "service_role";



GRANT ALL ON TABLE "public"."auth_errors" TO "anon";
GRANT ALL ON TABLE "public"."auth_errors" TO "authenticated";
GRANT ALL ON TABLE "public"."auth_errors" TO "service_role";



GRANT ALL ON TABLE "public"."bids" TO "anon";
GRANT ALL ON TABLE "public"."bids" TO "authenticated";
GRANT ALL ON TABLE "public"."bids" TO "service_role";



GRANT ALL ON TABLE "public"."email_logs" TO "anon";
GRANT ALL ON TABLE "public"."email_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."email_logs" TO "service_role";



GRANT ALL ON TABLE "public"."email_templates" TO "anon";
GRANT ALL ON TABLE "public"."email_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."email_templates" TO "service_role";



GRANT ALL ON TABLE "public"."email_verification" TO "anon";
GRANT ALL ON TABLE "public"."email_verification" TO "authenticated";
GRANT ALL ON TABLE "public"."email_verification" TO "service_role";



GRANT ALL ON TABLE "public"."items" TO "anon";
GRANT ALL ON TABLE "public"."items" TO "authenticated";
GRANT ALL ON TABLE "public"."items" TO "service_role";



GRANT ALL ON TABLE "public"."listings" TO "anon";
GRANT ALL ON TABLE "public"."listings" TO "authenticated";
GRANT ALL ON TABLE "public"."listings" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";
GRANT INSERT ON TABLE "public"."profiles" TO "supabase_auth_admin";



GRANT ALL ON TABLE "public"."public_profiles" TO "anon";
GRANT ALL ON TABLE "public"."public_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."public_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."signup_errors" TO "anon";
GRANT ALL ON TABLE "public"."signup_errors" TO "authenticated";
GRANT ALL ON TABLE "public"."signup_errors" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
