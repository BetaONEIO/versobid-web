-- Create email logs table\nCREATE TABLE IF NOT EXISTS email_logs (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  recipient TEXT NOT NULL,\n  subject TEXT NOT NULL,\n  template_name TEXT NOT NULL,\n  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),\n  error TEXT,\n  created_at TIMESTAMPTZ DEFAULT now(),\n  updated_at TIMESTAMPTZ\n);
\n\n-- Enable RLS\nALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
\n\n-- Create policy for admins\nCREATE POLICY "Admins can view all email logs"\n  ON email_logs\n  FOR SELECT\n  TO authenticated\n  USING (EXISTS (\n    SELECT 1 FROM profiles\n    WHERE profiles.id = auth.uid()\n    AND profiles.is_admin = true\n  ));
\n\n-- Create indexes\nCREATE INDEX idx_email_logs_recipient ON email_logs(recipient);
\nCREATE INDEX idx_email_logs_status ON email_logs(status);
\nCREATE INDEX idx_email_logs_created_at ON email_logs(created_at);
;
