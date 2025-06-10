CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Allow authenticated users to create notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (true);
