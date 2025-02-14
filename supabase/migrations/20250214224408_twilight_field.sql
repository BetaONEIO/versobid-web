-- Create function to handle welcome email with Resend integration
CREATE OR REPLACE FUNCTION send_welcome_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert welcome email into email_logs
  INSERT INTO email_logs (
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
      'name', COALESCE(NEW.full_name, NEW.username),
      'dashboard_link', current_setting('app.frontend_url', true) || '/dashboard'
    )
  );

  -- Create welcome notification
  INSERT INTO notifications (
    user_id,
    type,
    message,
    data
  ) VALUES (
    NEW.id,
    'welcome',
    'Welcome to VersoBid! Complete your profile to get started.',
    jsonb_build_object(
      'profile_link', '/profile/' || NEW.username
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS send_welcome_email_trigger ON profiles;
CREATE TRIGGER send_welcome_email_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION send_welcome_email();