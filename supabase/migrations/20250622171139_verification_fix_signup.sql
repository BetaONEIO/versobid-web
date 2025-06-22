CREATE OR REPLACE FUNCTION "public"."send_verification_email"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
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
        encode(extensions.gen_random_bytes(32), 'base64')
    )
  );

  RETURN NEW;
END;
$$;