-- Create email templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert welcome email template
INSERT INTO email_templates (name, subject, html_content) VALUES
('welcome', 'Welcome to VersoBid!', '
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
      <h2>Hi {{name}},</h2>
      <p>Thank you for joining VersoBid! We''re excited to have you as part of our community.</p>
      <p>With VersoBid, you can:</p>
      <ul>
        <li>Post items you want to buy</li>
        <li>Receive competitive bids from sellers</li>
        <li>Make secure payments through our platform</li>
      </ul>
      <a href="{{dashboard_link}}" class="button">Get Started</a>
      <p>If you have any questions, feel free to reach out to our support team.</p>
      <p>Best regards,<br>The VersoBid Team</p>
    </div>
  </div>
</body>
</html>
') ON CONFLICT (name) DO UPDATE 
SET subject = EXCLUDED.subject,
    html_content = EXCLUDED.html_content;

-- Create function to send welcome email
CREATE OR REPLACE FUNCTION send_welcome_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert welcome email into email_logs
  INSERT INTO email_logs (
    recipient,
    subject,
    template_name,
    status
  ) VALUES (
    NEW.email,
    'Welcome to VersoBid!',
    'welcome',
    'pending'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for welcome email
DROP TRIGGER IF EXISTS send_welcome_email_trigger ON profiles;
CREATE TRIGGER send_welcome_email_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION send_welcome_email();

-- Enable RLS on email_templates
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Create policy for email templates
CREATE POLICY "Allow read access to email templates"
  ON email_templates
  FOR SELECT
  TO authenticated
  USING (true);