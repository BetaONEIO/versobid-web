-- Create email verification template
INSERT INTO email_templates (name, subject, html_content) VALUES
('verify_email', 'Verify your VersoBid email address', '
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #4F46E5;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Verify Your Email</h1>
    </div>
    <div class="content">
      <h2>Welcome to VersoBid!</h2>
      <p>Please verify your email address by clicking the button below:</p>
      <a href="{{verification_link}}" class="button">Verify Email</a>
      <p>If you did not create an account, you can safely ignore this email.</p>
      <p>Best regards,<br>The VersoBid Team</p>
    </div>
  </div>
</body>
</html>
') ON CONFLICT (name) DO UPDATE 
SET subject = EXCLUDED.subject,
    html_content = EXCLUDED.html_content;

-- Create function to send verification email
CREATE OR REPLACE FUNCTION send_verification_email()
RETURNS TRIGGER AS $$
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
      'verification_link', current_setting('app.frontend_url', true) || '/verify-email?token=' || 
        encode(crypto.gen_random_bytes(32), 'base64')
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for verification email
DROP TRIGGER IF EXISTS send_verification_email_trigger ON auth.users;
CREATE TRIGGER send_verification_email_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION send_verification_email();

-- Only send welcome email after verification
CREATE OR REPLACE FUNCTION send_welcome_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Only send welcome email if email is verified
  IF NEW.email_confirmed_at IS NOT NULL THEN
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
      'Welcome to VersoBid! Your email has been verified.',
      jsonb_build_object(
        'profile_link', '/profile/' || NEW.username
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update welcome email trigger to fire on email verification
DROP TRIGGER IF EXISTS send_welcome_email_trigger ON profiles;
CREATE TRIGGER send_welcome_email_trigger
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION send_welcome_email();