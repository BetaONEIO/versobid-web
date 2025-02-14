-- Create email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default email templates
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
      <h1>Welcome to VersoBid!</h1>
    </div>
    <div class="content">
      <h2>Verify Your Email Address</h2>
      <p>Thanks for signing up! Please click the button below to verify your email address:</p>
      <a href="{{verification_link}}" class="button">Verify Email</a>
      <p>If you did not create an account, you can safely ignore this email.</p>
    </div>
  </div>
</body>
</html>
'),
('welcome', 'Welcome to VersoBid - Email Verified!', '
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
      <h1>Email Verified!</h1>
    </div>
    <div class="content">
      <h2>Welcome to VersoBid</h2>
      <p>Your email has been verified successfully. You can now start using all features of VersoBid!</p>
      <p>Get started by completing your profile and exploring items:</p>
      <a href="{{dashboard_link}}" class="button">Go to Dashboard</a>
    </div>
  </div>
</body>
</html>
');

-- Create function to send verification email
CREATE OR REPLACE FUNCTION send_verification_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the email sending attempt
  INSERT INTO email_logs (
    recipient,
    subject,
    template_name,
    status
  ) VALUES (
    NEW.email,
    'Verify your VersoBid email address',
    'verify_email',
    'pending'
  );

  -- Create notification
  INSERT INTO notifications (
    user_id,
    type,
    message,
    data
  ) VALUES (
    NEW.id,
    'email_verification',
    'Please verify your email address',
    jsonb_build_object(
      'email', NEW.email,
      'verification_link', format('%s/verify-email?token=%s', 
        current_setting('app.frontend_url', true),
        encode(gen_random_bytes(32), 'base64')
      )
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle email verification
CREATE OR REPLACE FUNCTION handle_email_verification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    -- Log welcome email
    INSERT INTO email_logs (
      recipient,
      subject,
      template_name,
      status
    ) VALUES (
      NEW.email,
      'Welcome to VersoBid - Email Verified!',
      'welcome',
      'pending'
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
        'email', NEW.email,
        'verified_at', NEW.email_confirmed_at
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS send_verification_email_trigger ON auth.users;
CREATE TRIGGER send_verification_email_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION send_verification_email();

DROP TRIGGER IF EXISTS handle_email_verification_trigger ON auth.users;
CREATE TRIGGER handle_email_verification_trigger
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_email_verification();

-- Update RLS policies
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view email templates"
  ON email_templates
  FOR SELECT
  TO public
  USING (true);