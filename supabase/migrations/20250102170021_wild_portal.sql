-- Add admin column to profiles table\nALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
\n\n-- Create admin policy\nCREATE POLICY "Admins can view all profiles"\n  ON profiles\n  FOR SELECT\n  TO authenticated\n  USING (auth.uid() IN (\n    SELECT id FROM profiles WHERE is_admin = true\n  ));
\n\n-- Create function to check if user is admin\nCREATE OR REPLACE FUNCTION is_admin(user_id UUID)\nRETURNS BOOLEAN AS $$\nBEGIN\n  RETURN EXISTS (\n    SELECT 1 FROM profiles\n    WHERE id = user_id AND is_admin = true\n  );
\nEND;
\n$$ LANGUAGE plpgsql SECURITY DEFINER;
;
