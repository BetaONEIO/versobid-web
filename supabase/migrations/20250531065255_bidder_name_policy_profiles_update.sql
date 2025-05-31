CREATE POLICY "Users can view basic profile info" 
ON "public"."profiles" 
FOR SELECT 
TO authenticated 
USING (true);
