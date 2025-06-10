-- Allow authenticated users to create notifications for any user
CREATE POLICY "Users can create notifications for others"
ON "public"."notifications"
FOR INSERT
TO authenticated
WITH CHECK (true);
