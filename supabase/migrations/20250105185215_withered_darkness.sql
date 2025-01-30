-- Drop existing table and policies
DROP TABLE IF EXISTS email_logs CASCADE;

-- Create email logs table
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  template_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'sent', 'failed'))
);

-- Enable RLS
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for admins
CREATE POLICY "Admins can manage email logs"
  ON email_logs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create indexes
CREATE INDEX idx_email_logs_recipient ON email_logs(recipient);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_email_log_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_logs_timestamp
  BEFORE UPDATE ON email_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_email_log_timestamp();