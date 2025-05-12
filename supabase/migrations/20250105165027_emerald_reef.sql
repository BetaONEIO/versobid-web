\n\n-- Create or replace the admin check function\nCREATE OR REPLACE FUNCTION is_admin()\nRETURNS BOOLEAN AS $$\nBEGIN\n  RETURN EXISTS (\n    SELECT 1 FROM profiles\n    WHERE id = auth.uid()\n    AND is_admin = true\n  );
\nEND;
\n$$ LANGUAGE plpgsql SECURITY DEFINER;
\n\n-- Add admin policy to profiles\nCREATE POLICY "Admins can view all profiles"\n  ON profiles\n  FOR ALL\n  TO authenticated\n  USING (is_admin());
\n\n-- Add admin policy to items\nCREATE POLICY "Admins can manage all items"\n  ON items\n  FOR ALL\n  TO authenticated\n  USING (is_admin());
;
