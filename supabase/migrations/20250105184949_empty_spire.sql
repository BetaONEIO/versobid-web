-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Admins can view all email logs" ON email_logs;

-- Create email logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  template_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for admins
CREATE POLICY "Admins can view all email logs"
  ON email_logs
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  ));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at);